package com.ltim.restaurant.orders;

import com.ltim.restaurant.menu.MenuItemRepository;
import com.ltim.restaurant.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static com.ltim.restaurant.orders.OrderDtos.*;

@Service
public class OrderService {
	private final OrderRepository orderRepository;
	private final MenuItemRepository menuRepository;

	public OrderService(OrderRepository orderRepository, MenuItemRepository menuRepository) {
		this.orderRepository = orderRepository;
		this.menuRepository = menuRepository;
	}

	@Transactional
	public OrderResponse create(User user, CreateOrderRequest req) {
		BigDecimal tip = req.tip() == null ? BigDecimal.ZERO : req.tip();
		String note = req.note() == null ? null : req.note().trim();
		if (note != null && note.isEmpty()) {
			note = null;
		}

		OrderEntity order = OrderEntity.builder()
				.user(user)
				.status(OrderStatus.PLACED)
				.totalAmount(BigDecimal.ZERO)
				.tip(tip)
				.note(note)
				.createdAt(Instant.now())
				.build();

		BigDecimal total = BigDecimal.ZERO;
		for (CreateOrderItemRequest itemReq : req.items()) {
			var menuItem = menuRepository.findById(itemReq.menuItemId())
					.orElseThrow(() -> new IllegalArgumentException("Invalid menuItemId: " + itemReq.menuItemId()));
			if (!menuItem.isActive()) {
				throw new IllegalArgumentException("Menu item inactive: " + menuItem.getId());
			}

			var unit = menuItem.getPrice();
			var lineTotal = unit.multiply(BigDecimal.valueOf(itemReq.quantity()));
			total = total.add(lineTotal);

			order.addItem(OrderItemEntity.builder()
					.menuItem(menuItem)
					.quantity(itemReq.quantity())
					.unitPrice(unit)
					.build());
		}

		order.setTotalAmount(total);
		order = orderRepository.save(order);
		return toResponse(order);
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> listForUser(Long userId) {
		return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public OrderResponse getForUser(Long userId, Long orderId) {
		OrderEntity order = orderRepository.findById(orderId)
				.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		if (!order.getUser().getId().equals(userId)) {
			throw new IllegalArgumentException("Order not found");
		}
		return toResponse(order);
	}

	@Transactional
	public OrderResponse updateStatus(Long orderId, OrderStatus status) {
		OrderEntity order = orderRepository.findById(orderId)
				.orElseThrow(() -> new IllegalArgumentException("Order not found"));
		order.setStatus(status);
		return toResponse(order);
	}

	private OrderResponse toResponse(OrderEntity order) {
		var items = order.getItems().stream().map(oi -> {
			var mi = oi.getMenuItem();
			var lineTotal = oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQuantity()));
			return new OrderItemResponse(mi.getId(), mi.getName(), mi.getCategory(), oi.getQuantity(), oi.getUnitPrice(), lineTotal);
		}).toList();

		BigDecimal tip = order.getTip() == null ? BigDecimal.ZERO : order.getTip();
		BigDecimal grandTotal = order.getTotalAmount().add(tip);
		return new OrderResponse(order.getId(), order.getStatus(), order.getTotalAmount(), tip, grandTotal, order.getNote(), order.getCreatedAt(), items);
	}
}
