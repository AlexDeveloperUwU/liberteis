<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Markmap</title>
<style>
* {
  margin: 0;
  padding: 0;
}
#mindmap {
  display: block;
  width: 100vw;
  height: 100vh;
}
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/style.css">
</head>
<body>
<svg id="mindmap"></svg>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script><script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script><script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script><script>(()=>{setTimeout(()=>{const{markmap:x,mm:K}=window,P=new x.Toolbar;P.attach(K);const F=P.render();F.setAttribute("style","position:absolute;bottom:20px;right:20px"),document.body.append(F)})})()</script><script>((b,L,T,D)=>{const H=b();window.mm=H.Markmap.create("svg#mindmap",(L||H.deriveOptions)(D),T)})(()=>window.markmap,null,{"content":"Database Structure","children":[{"content":"config","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"3,4"}},{"content":"<strong>value</strong>: <code>varchar(255)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"4,6"}}],"payload":{"tag":"h2","lines":"2,3"}},{"content":"users","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"7,8"}},{"content":"<strong>name</strong>: <code>varchar(100)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"8,9"}},{"content":"<strong>email</strong>: <code>varchar(255)</code> (mandatory, unique)","children":[],"payload":{"tag":"li","lines":"9,10"}},{"content":"<strong>hashedPassword</strong>: <code>varchar(255)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"10,11"}},{"content":"<strong>type</strong>: <code>varchar(20)</code> (default: <code>normalUser</code>)","children":[],"payload":{"tag":"li","lines":"11,12"}},{"content":"<strong>createdBy</strong>: <code>varchar(50)</code> (FK to <code>users.id</code>)","children":[],"payload":{"tag":"li","lines":"12,13"}},{"content":"<strong>createdDate</strong>: <code>datetime</code> (default: <code>current_timestamp</code>)","children":[],"payload":{"tag":"li","lines":"13,14"}},{"content":"<strong>lastLogin</strong>: <code>datetime</code> (optional)","children":[],"payload":{"tag":"li","lines":"14,15"}},{"content":"<strong>lang</strong>: <code>varchar(2)</code> (default: <code>gl</code>)","children":[],"payload":{"tag":"li","lines":"15,16"}},{"content":"<strong>deleted</strong>: <code>boolean</code> (default: <code>false</code>)","children":[],"payload":{"tag":"li","lines":"16,18"}}],"payload":{"tag":"h2","lines":"6,7"}},{"content":"spaces","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"19,20"}},{"content":"<strong>name</strong>: <code>varchar(100)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"20,21"}},{"content":"<strong>location</strong>: <code>varchar(255)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"21,22"}},{"content":"<strong>info</strong>: <code>varchar(500)</code> (optional)","children":[],"payload":{"tag":"li","lines":"22,23"}},{"content":"<strong>createdBy</strong>: <code>varchar(50)</code> (FK to <code>users.id</code>)","children":[],"payload":{"tag":"li","lines":"23,24"}},{"content":"<strong>deleted</strong>: <code>boolean</code> (default: <code>false</code>)","children":[],"payload":{"tag":"li","lines":"24,26"}}],"payload":{"tag":"h2","lines":"18,19"}},{"content":"categories","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"27,28"}},{"content":"<strong>name</strong>: <code>varchar(100)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"28,29"}},{"content":"<strong>spaces</strong>: <code>json</code> (optional)","children":[],"payload":{"tag":"li","lines":"29,30"}},{"content":"<strong>createdBy</strong>: <code>varchar(50)</code> (FK to <code>users.id</code>)","children":[],"payload":{"tag":"li","lines":"30,31"}},{"content":"<strong>deleted</strong>: <code>boolean</code> (default: <code>false</code>)","children":[],"payload":{"tag":"li","lines":"31,33"}}],"payload":{"tag":"h2","lines":"26,27"}},{"content":"events","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"34,35"}},{"content":"<strong>title</strong>: <code>varchar(200)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"35,36"}},{"content":"<strong>info</strong>: <code>varchar(500)</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"36,37"}},{"content":"<strong>duration</strong>: <code>integer</code> (default: 30)","children":[],"payload":{"tag":"li","lines":"37,38"}},{"content":"<strong>coverUrl</strong>: <code>varchar(500)</code> (optional)","children":[],"payload":{"tag":"li","lines":"38,39"}},{"content":"<strong>qrUrl</strong>: <code>varchar(500)</code> (optional)","children":[],"payload":{"tag":"li","lines":"39,40"}},{"content":"<strong>category</strong>: <code>varchar(50)</code> (FK to <code>categories.id</code>)","children":[],"payload":{"tag":"li","lines":"40,41"}},{"content":"<strong>createdBy</strong>: <code>varchar(50)</code> (FK to <code>users.id</code>)","children":[],"payload":{"tag":"li","lines":"41,42"}},{"content":"<strong>deleted</strong>: <code>boolean</code> (default: <code>false</code>)","children":[],"payload":{"tag":"li","lines":"42,44"}}],"payload":{"tag":"h2","lines":"33,34"}},{"content":"bookings","children":[{"content":"<strong>id</strong>: <code>varchar(50)</code> (PK, mandatory)","children":[],"payload":{"tag":"li","lines":"45,46"}},{"content":"<strong>eventId</strong>: <code>varchar(50)</code> (FK to <code>events.id</code>)","children":[],"payload":{"tag":"li","lines":"46,47"}},{"content":"<strong>space</strong>: <code>varchar(50)</code> (FK to <code>spaces.id</code>)","children":[],"payload":{"tag":"li","lines":"47,48"}},{"content":"<strong>bookingDate</strong>: <code>date</code> (mandatory)","children":[],"payload":{"tag":"li","lines":"48,49"}},{"content":"<strong>bookedBy</strong>: <code>varchar(50)</code> (FK to <code>users.id</code>)","children":[],"payload":{"tag":"li","lines":"49,50"}},{"content":"<strong>bookedDate</strong>: <code>datetime</code> (default: <code>current_timestamp</code>)","children":[],"payload":{"tag":"li","lines":"50,51"}},{"content":"<strong>info</strong>: <code>varchar(500)</code> (optional)","children":[],"payload":{"tag":"li","lines":"51,52"}},{"content":"<strong>status</strong>: <code>varchar(20)</code> (default: <code>active</code>, can be <code>active</code> or <code>cancelled</code>)","children":[],"payload":{"tag":"li","lines":"52,53"}},{"content":"<strong>deleted</strong>: <code>boolean</code> (default: <code>false</code>)","children":[],"payload":{"tag":"li","lines":"53,54"}}],"payload":{"tag":"h2","lines":"44,45"}}],"payload":{"tag":"h1","lines":"0,1"}},null)</script>
</body>
</html>

### **Table `config`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **value**: `varchar(255)`
  - Maximum length of 255 characters.
  - This field is mandatory.

### **Table `users`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **name**: `varchar(100)`
  - Maximum length of 100 characters.
  - This field is mandatory.
- **email**: `varchar(255)`
  - Maximum length of 255 characters.
  - This field is mandatory and must be unique.
- **hashedPassword**: `varchar(255)`
  - Maximum length of 255 characters.
  - This field is mandatory.
- **type**: `varchar(20)`
  - Maximum length of 20 characters.
  - Default value: `normalUser`.
- **createdBy**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and refers to the `user.id` of the user who created this user.
- **createdDate**: `datetime`
  - Stores the date and time the user was created.
  - Default value: the current date and time at the moment of creation.
- **lastLogin**: `datetime`
  - Stores the date and time of the last login (optional).
- **lang**: `varchar(2)`
  - Maximum length of 2 characters.
  - Default value: `gl` (can be a language code, such as `en` for English, etc.).
- **deleted**: `boolean`
  - Indicates if the user is marked as deleted.
  - Default value: `false` (not deleted).

### **Table `spaces`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **name**: `varchar(100)`
  - Maximum length of 100 characters.
  - This field is mandatory.
- **location**: `varchar(255)`
  - Maximum length of 255 characters.
  - This field is mandatory.
- **info**: `varchar(500)`
  - Maximum length of 500 characters.
  - This field is optional.
- **createdBy**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `user.id` of the user who created this space.
- **deleted**: `boolean`
  - Indicates if the space is marked as deleted.
  - Default value: `false` (not deleted).

### **Table `categories`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **name**: `varchar(100)`
  - Maximum length of 100 characters.
  - This field is mandatory.
- **spaces**: `json`
  - Contains a list of spaces (JSON), can be used to store data related to the category's spaces.
- **createdBy**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `user.id` of the user who created this category.
- **deleted**: `boolean`
  - Indicates if the category is marked as deleted.
  - Default value: `false` (not deleted).

### **Table `events`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **title**: `varchar(200)`
  - Maximum length of 200 characters.
  - This field is mandatory.
- **info**: `varchar(500)`
  - Maximum length of 500 characters.
  - This field is mandatory.
- **duration**: `integer`
  - Duration of the event in minutes.
  - Default value: 30 minutes.
- **coverUrl**: `varchar(500)`
  - Maximum length of 500 characters.
  - This field is optional, can be used to store the URL of the event's cover image.
- **qrUrl**: `varchar(500)`
  - Maximum length of 500 characters.
  - This field is optional, can be used to store the URL of the QR code associated with the event.
- **category**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `category.id` of the category to which the event belongs.
- **createdBy**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `user.id` of the user who created this event.
- **deleted**: `boolean`
  - Indicates if the event is marked as deleted.
  - Default value: `false` (not deleted).

### **Table `bookings`**

- **id**: `varchar(50)`
  - Maximum length of 50 characters.
  - This field is mandatory and acts as the primary key.
- **eventId**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `event.id` of the event being booked.
- **space**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `space.id` of the space being booked.
- **bookingDate**: `date`
  - This field is mandatory and stores the date of the booking.
- **bookedBy**: `varchar(50)`
  - Maximum length of 50 characters.
  - Refers to the `user.id` of the user who made the booking.
- **bookedDate**: `datetime`
  - This field is mandatory and stores the date and time the booking was created.
  - Default value: the current date and time at the moment of creation.
- **info**: `varchar(500)`
  - Maximum length of 500 characters.
  - This field is optional and can contain additional booking details.
- **status**: `varchar(20)`
  - Maximum length of 20 characters.
  - Default value: `active`, can be `active` or `cancelled`.
- **deleted**: `boolean`
  - Indicates if the booking is marked as deleted.
  - Default value: `false` (not deleted).
