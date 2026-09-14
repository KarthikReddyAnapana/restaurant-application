package com.ltim.restaurant.recommendation;

import com.ltim.restaurant.menu.MenuItem;
import com.ltim.restaurant.menu.MenuItemRepository;
import com.ltim.restaurant.orders.OrderRepository;
import com.ltim.restaurant.user.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
	private final OrderRepository orderRepository;
	private final MenuItemRepository menuRepository;

	public RecommendationController(OrderRepository orderRepository, MenuItemRepository menuRepository) {
		this.orderRepository = orderRepository;
		this.menuRepository = menuRepository;
	}

	public record Recommendation(Long menuItemId, String name, String reason) {}

	@GetMapping
	public List<Recommendation> recommend(org.springframework.security.core.Authentication auth) {
		User user = (User) auth.getPrincipal();

		// Explainable heuristic:
		// 1) Find the user's top ordered category
		// 2) Recommend active items from that category not seen recently
		var orders = orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
		if (orders.isEmpty()) {
			// Cold start: recommend popular-ish defaults (first few active items)
			return menuRepository.findAllByActiveTrueOrderByCategoryAscNameAsc().stream()
					.limit(5)
					.map(mi -> new Recommendation(mi.getId(), mi.getName(), "New here: popular starter picks"))
					.toList();
		}

		Map<String, Integer> categoryCounts = new HashMap<>();
		Set<Long> alreadyOrdered = new HashSet<>();
		orders.forEach(o -> o.getItems().forEach(oi -> {
			MenuItem mi = oi.getMenuItem();
			alreadyOrdered.add(mi.getId());
			categoryCounts.merge(mi.getCategory(), oi.getQuantity(), Integer::sum);
		}));

		String topCategory = categoryCounts.entrySet().stream()
				.max(Map.Entry.comparingByValue())
				.map(Map.Entry::getKey)
				.orElse(null);

		var candidates = menuRepository.findAllByActiveTrueOrderByCategoryAscNameAsc();
		return candidates.stream()
				.filter(mi -> topCategory == null || mi.getCategory().equals(topCategory))
				.filter(mi -> !alreadyOrdered.contains(mi.getId()))
				.limit(5)
				.map(mi -> new Recommendation(
						mi.getId(),
						mi.getName(),
						"Because you often order " + topCategory + " (based on your order history)"
				))
				.toList();
	}
}
