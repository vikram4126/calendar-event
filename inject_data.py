import json

with open('/Users/vikram/Desktop/Antigravity/calender-events/public/events.json', 'r') as f:
    json_data = f.read()

with open('/Users/vikram/Desktop/Antigravity/calender-events/calendar-vanilla.html', 'r') as f:
    html = f.read()

start_marker = "        var CALENDAR_DATA = {"
end_marker = "        var ACTIVITY_ICONS = {"

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + "        var CALENDAR_DATA = " + json_data + ";\n\n\n" + html[end_idx:]
    with open('/Users/vikram/Desktop/Antigravity/calender-events/calendar-vanilla.html', 'w') as f:
        f.write(new_html)
    print("Injected successfully!")
else:
    print("Markers not found.")
