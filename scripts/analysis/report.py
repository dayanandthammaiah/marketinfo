import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime

def generate_html_report(data):
    """
    Generates HTML report from data using Jinja2 template.
    """
    template_dir = os.path.join(os.path.dirname(__file__), '../templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('email_report.html')
    
    # Prepare data for template
    top_picks = ", ".join([s['name'] for s in data['nifty_50'][:3]])
    
    html_content = template.render(
        date=datetime.now().strftime("%Y-%m-%d"),
        top_picks=top_picks,
        nifty_50=data['nifty_50'],
        crypto=data['crypto']
    )
    
    return html_content
