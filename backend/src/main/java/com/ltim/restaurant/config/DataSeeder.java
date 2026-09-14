package com.ltim.restaurant.config;

import com.ltim.restaurant.menu.MenuItem;
import com.ltim.restaurant.menu.MenuItemRepository;
import com.ltim.restaurant.user.User;
import com.ltim.restaurant.user.UserRepository;
import com.ltim.restaurant.user.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
	private final MenuItemRepository menuRepo;
	private final UserRepository userRepo;
	private final PasswordEncoder encoder;

	public DataSeeder(MenuItemRepository menuRepo, UserRepository userRepo, PasswordEncoder encoder) {
		this.menuRepo = menuRepo;
		this.userRepo = userRepo;
		this.encoder = encoder;
	}

	@Override
	public void run(String... args) {
		seedUsers();
		seedMenu();
	}

	private void seedUsers() {
		if (!userRepo.existsByEmail("admin@demo.com")) {
			userRepo.save(User.builder()
					.email("admin@demo.com")
					.passwordHash(encoder.encode("admin123"))
					.role(UserRole.ADMIN)
					.createdAt(Instant.now())
					.build());
		}
	}

	private void seedMenu() {
		if (menuRepo.count() > 0) return;

		var items = List.of(
				MenuItem.builder().name("Margherita Pizza").category("Pizza").price(new BigDecimal("249.00")).vegetarian(true).spiceLevel(1).active(true).build(),
				MenuItem.builder().name("Chicken Tikka Pizza").category("Pizza").price(new BigDecimal("329.00")).vegetarian(false).spiceLevel(2).active(true).build(),
				MenuItem.builder().name("Veg Burger").category("Burger").price(new BigDecimal("159.00")).vegetarian(true).spiceLevel(1).active(true).build(),
				MenuItem.builder().name("Chicken Burger").category("Burger").price(new BigDecimal("199.00")).vegetarian(false).spiceLevel(2).active(true).build(),
				MenuItem.builder().name("Paneer Biryani").category("Biryani").price(new BigDecimal("269.00")).vegetarian(true).spiceLevel(2).active(true).build(),
				MenuItem.builder().name("Chicken Biryani").category("Biryani").price(new BigDecimal("299.00")).vegetarian(false).spiceLevel(3).active(true).build(),
				MenuItem.builder().name("Gulab Jamun").category("Dessert").price(new BigDecimal("99.00")).vegetarian(true).spiceLevel(0).active(true).build()
		);

		menuRepo.saveAll(items);
	}
}
