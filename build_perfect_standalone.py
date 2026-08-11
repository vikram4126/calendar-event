import json
import os

ROOT = '/Users/vikram/Desktop/Antigravity/calender-events'

def build_perfect_standalone():
    with open(os.path.join(ROOT, 'public/events.json'), 'r') as f:
        events_data = f.read()

    with open(os.path.join(ROOT, 'dist/index.html'), 'r') as f:
        html = f.read()

    # Create the script tag for data
    script_tag = f"""<script>
        // ==========================================
        // UPDATE YOUR EVENTS DATA HERE
        // ==========================================
        window.INLINE_EVENTS_DATA = {events_data};
    </script>"""

    # Inject right after <title>temp-app</title> to safely place it in head without hitting JS strings
    final_html = html.replace('<title>temp-app</title>', '<title>temp-app</title>\n' + script_tag, 1)

    import re, base64

    # Read favicon and inline it as a data URI so no external file is needed
    with open(os.path.join(ROOT, 'public/favicon.svg'), 'rb') as fav:
        fav_b64 = base64.b64encode(fav.read()).decode()
    fav_data_uri = f'data:image/svg+xml;base64,{fav_b64}'

    # Extract the bundled JS and move it to the end of the body so it runs after the DOM is parsed
    script_pattern = re.compile(r'<script type="module" crossorigin>.*?</script>', re.DOTALL)
    match = script_pattern.search(final_html)
    if match:
        script_content = match.group(0)
        final_html = final_html.replace(script_content, '')
        final_html = final_html.replace('</body>', script_content.replace('<script type="module" crossorigin>', '<script>') + '\n</body>')
    else:
        final_html = final_html.replace('<script type="module" crossorigin>', '<script>')

    # Replace the external favicon link with an inline data URI
    final_html = re.sub(r'href="[^"]*favicon\.svg"', f'href="{fav_data_uri}"', final_html)

    with open(os.path.join(ROOT, 'standalone.html'), 'w') as f:
        f.write(final_html)

if __name__ == '__main__':
    build_perfect_standalone()
