package com.ltim.restaurant.menu;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
	private final MenuItemRepository repo;

	public MenuController(MenuItemRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public List<MenuItem> list() {
		return repo.findAllByActiveTrueOrderByCategoryAscNameAsc();
	}
}
