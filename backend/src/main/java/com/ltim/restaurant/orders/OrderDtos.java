package com.ltim.restaurant.orders;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class OrderDtos {
	private OrderDtos() {}

	public record CreateOrderItemRequest(
			@NotNull Long menuItemId,
			@Min(1) int quantity
	) {}

	public record CreateOrderRequest(
			@NotEmpty List<CreateOrderItemRequest> items,
			@Size(max = 500) String note,
			@DecimalMin(value = "0.0") BigDecimal tip
	) {}

	public record OrderItemResponse(
			Long menuItemId,
			String name,
			String category,
			int quantity,
			BigDecimal unitPrice,
			BigDecimal lineTotal
	) {}

	public record OrderResponse(
			Long id,
			OrderStatus status,
			BigDecimal totalAmount,
			BigDecimal tip,
			BigDecimal grandTotal,
			String note,
			Instant createdAt,
			List<OrderItemResponse> items
	) {}
}
