package com.ltim.restaurant.orders;

import com.ltim.restaurant.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	private User user;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private OrderStatus status;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@Column(precision = 10, scale = 2)
	private BigDecimal tip;

	// Optional customer note, e.g. "please also bring extra napkins / a bottle of water"
	@Column(length = 500)
	private String note;

	@Column(nullable = false)
	private Instant createdAt;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<OrderItemEntity> items = new ArrayList<>();

	public void addItem(OrderItemEntity item) {
		items.add(item);
		item.setOrder(this);
	}
}
