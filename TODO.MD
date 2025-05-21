[X] - Implement mapbox on main page
[X] - Add drizzle database
[X] - Webhook to update neon database when a new user is created via Kinde (auth)
[X] - Add sections for a user to create / update their first name, last name, email, username / display name and location. (Require email authentication, Resend for confirm flow)
[X] - Delete button that purges, avatar, records etc
[X] - Image table must be deleted first for a user, upload thing first then delete otherwise foreign key constraint error
[X] - Notifcation bar needs to also use the store
[X] - Mark all as read button needs to work

Next:
[X] - Clicking on map updates zustand store with an array of objects with lng / lat. On the left hand menu with the points it should update it first. 
[X] - First click without any marker is set to first and the second is set to last. Then any additional ones are added inbetween
[?] - Right click on map opens up popup (maybe map.onClick first as it will keep the popup on the marker. See https://github.dev/visgl/react-map-gl/tree/8.0-release/examples/mapbox/controls/src)
this popup allows for "Add", "Delete" Set as start, set as destination, Create Via Point. Mark favourite etc

[ ] - Ability to export to gpx
[ ] - Allow a user to create a new route, update via database and display if draft or published. Provide it on the my routes page
[ ] - Search bar to find a route and update co ords


[BLOCKED] - Force the session to logout the page, currently auth routes are not picking up a user has their session removed
[ ] - Add rate limiting to DB requests
