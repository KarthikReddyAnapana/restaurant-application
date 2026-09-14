package com.ltim.restaurant.orders;

import com.ltim.restaurant.user.User;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ltim.restaurant.orders.OrderDtos.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	public OrderResponse create(@Valid @RequestBody CreateOrderRequest req, org.springframework.security.core.Authentication auth) {
		User user = (User) auth.getPrincipal();
		return orderService.create(user, req);
	}

	@GetMapping
	public List<OrderResponse> list(org.springframework.security.core.Authentication auth) {
		User user = (User) auth.getPrincipal();
		return orderService.listForUser(user.getId());
	}

	@GetMapping("/{orderId}")
	public OrderResponse get(@PathVariable Long orderId, org.springframework.security.core.Authentication auth) {
		User user = (User) auth.getPrincipal();
		return orderService.getForUser(user.getId(), orderId);
	}

	public record UpdateStatusRequest(OrderStatus status) {}

	@PatchMapping("/{orderId}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public OrderResponse updateStatus(@PathVariable Long orderId, @RequestBody UpdateStatusRequest req) {
		return orderService.updateStatus(orderId, req.status());
	}
}
