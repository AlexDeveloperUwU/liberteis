# Categories Service

This document explains the functions available in the `categoriesService.js` file.

## Functions

### addCategory(category)

Adds a new category to the database.

### updateCategory(id, category)

Updates an existing category in the database.

### changeCategoryStatus(id)

Enables or disables a category in the database.

### enableCategory(id)

Enables a category in the database.

### disableCategory(id)

Disables a category in the database.

### getCategory(id, includeInactive = false)

Retrieves a category from the database. Optionally includes inactive categories.

### getCategoryByName(name, includeInactive = false)

Retrieves a category by name from the database. Optionally includes inactive categories.

### getCategories(status)

Retrieves all categories from the database. Can return all, active (default), or inactive categories.

### checkCategoryStatus(id)

Checks the status of a category in the database.

### checkCategoryExists(title)

Checks if a category exists in the database by title.
