AlexDeveloperUwU: Hazme una revisión de todos los servicios y apis, y en base a eso, necesito saber que funciones del service no se utilizan.

GitHub Copilot: Claro, aquí tienes un **análisis de uso de funciones** para todos los servicios (`Service`) y sus respectivas APIs (`Api`) en tu proyecto. El objetivo es identificar **qué funciones exportadas en cada service no están siendo utilizadas por las rutas de la API**.

---

## 1. **User Service (userService.js)**

### Funciones exportadas:

- addUser
- updateUser
- toggleUserStatus
- updateUserLastLogin
- updateUserPassword
- getUser
- getUserByEmail
- getUsers
- getUsersCount
- checkUserExists

### Usos en API (usersApi.js, authApi.js):

- **addUser** → POST `/api/users`
- **updateUser** → PUT `/api/users`
- **toggleUserStatus** → PATCH `/api/users/toggle`
- **updateUserLastLogin** → POST `/api/auth/login`
- **updateUserPassword** → PUT `/api/users`
- **getUser** → GET `/api/users` (por id)
- **getUserByEmail** → POST `/api/auth/login`
- **getUsers** → GET `/api/users` (listado)
- **getUsersCount** → GET `/api/users/count`
- **checkUserExists** → GET `/api/users/emailCheck`

**Resultado:**  
**Todas las funciones exportadas en userService.js son utilizadas por las rutas de la API.**

---

## 2. **Spaces Service (spacesService.js)**

### Funciones exportadas:

- addSpace
- updateSpace
- toggleSpaceStatus
- getSpace
- getSpaces
- getSpacesCount

### Usos en API (spacesApi.js):

- **addSpace** → POST `/api/spaces`
- **updateSpace** → PUT `/api/spaces`
- **toggleSpaceStatus** → PATCH `/api/spaces/toggle`
- **getSpace** → GET `/api/spaces` (por id)
- **getSpaces** → GET `/api/spaces` (listado)
- **getSpacesCount** → GET `/api/spaces/count`

**Resultado:**  
**Todas las funciones exportadas en spacesService.js son utilizadas por las rutas de la API.**

---

## 3. **Events Service (eventsService.js)**

### Funciones exportadas:

- addEvent
- updateEvent
- changeEventStatus
- getEvent
- getEventByTitle
- getEvents
- getEventStatus
- checkEventExists
- getEventsByCategory
- getEventsCount

### Usos en API (eventsApi.js):

- **addEvent** → POST `/api/events`
- **updateEvent** → PUT `/api/events`
- **changeEventStatus** → PATCH `/api/events/toggle`
- **getEvent** → GET `/api/events` (por id)
- **getEvents** → GET `/api/events` (listado)
- **getEventsByCategory** → GET `/api/events/category`
- **getEventsCount** → GET `/api/events/count`

#### **No se usan en la API:**

- **getEventByTitle**
- **getEventStatus**
- **checkEventExists**

---

## 4. **Categories Service (categoriesService.js)**

### Funciones exportadas:

- addCategory
- updateCategory
- changeCategoryStatus
- getCategory
- getCategories
- getCategoriesCount

### Usos en API (categoriesApi.js):

- **addCategory** → POST `/api/categories`
- **updateCategory** → PUT `/api/categories`
- **changeCategoryStatus** → PATCH `/api/categories/toggle`
- **getCategory** → GET `/api/categories` (por id)
- **getCategories** → GET `/api/categories` (listado)
- **getCategoriesCount** → GET `/api/categories/count`

**Resultado:**  
**Todas las funciones exportadas en categoriesService.js son utilizadas por las rutas de la API.**

---

## 5. **Bookings Service (bookingsService.js)**

### Funciones exportadas:

- addBooking
- updateBooking
- changeBookingStatus
- enableBooking
- disableBooking
- getBooking
- getBookingByEventAndDate
- getBookings
- getBookingsByEvent
- getBookingsByUser
- getBookingStatus
- checkBookingStatus
- validateSpaceForEvent
- checkSpaceAvailability
- getBookingsCount

### Usos en API (bookingsApi.js):

- **addBooking** → POST `/api/bookings`
- **updateBooking** → PUT `/api/bookings`
- **changeBookingStatus** → PATCH `/api/bookings/toggle`
- **getBooking** → GET `/api/bookings` (por id)
- **getBookings** → GET `/api/bookings` (listado)
- **getBookingsByEvent** → GET `/api/bookings/event`
- **getBookingsByUser** → GET `/api/bookings/user`
- **getBookingsCount** → GET `/api/bookings/count`

#### **No se usan en la API:**

- **enableBooking**
- **disableBooking**
- **getBookingByEventAndDate**
- **getBookingStatus**
- **checkBookingStatus**
- **validateSpaceForEvent** (solo se usa internamente en el propio service)
- **checkSpaceAvailability** (solo se usa internamente en el propio service)

---

## 6. **Config Service (configService.js)**

### Funciones exportadas:

- setConfig
- updateConfig
- deleteConfig
- getConfig
- getConfigs
- checkConfigExistence

### Usos en API (configApi.js):

- **setConfig** → POST `/api/configs`
- **updateConfig** → PUT `/api/configs`
- **deleteConfig** → DELETE `/api/configs`
- **getConfig** → GET `/api/configs` (por key)
- **getConfigs** → GET `/api/configs` (listado)
- **checkConfigExistence** → GET/POST/PUT/DELETE `/api/configs` (para validaciones previas)

**Resultado:**  
**Todas las funciones exportadas en configService.js son utilizadas por las rutas de la API.**

---

# **Resumen de funciones no utilizadas en las APIs**

### **Events Service**

- `getEventByTitle`
- `getEventStatus`
- `checkEventExists`

### **Bookings Service**

- `enableBooking`
- `disableBooking`
- `getBookingByEventAndDate`
- `getBookingStatus`
- `checkBookingStatus`
- `validateSpaceForEvent` _(solo uso interno)_
- `checkSpaceAvailability` _(solo uso interno)_

---

## **Conclusión**

- **La mayoría de los servicios están completamente utilizados por sus APIs.**
- **Las funciones no utilizadas** suelen ser utilidades internas, comprobaciones o funciones auxiliares que podrían ser útiles para futuras ampliaciones, pero actualmente **no están expuestas ni llamadas desde las rutas de la API**.

¿Quieres que te sugiera eliminar alguna de estas funciones, o prefieres mantenerlas para posibles usos futuros?
