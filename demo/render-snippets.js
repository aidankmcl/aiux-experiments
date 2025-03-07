document.addEventListener('DOMContentLoaded', () => {
    // Find all demo sections
    document.querySelectorAll('.demo').forEach(demo => {
      const template = demo.querySelector('template');
      const codeDisplay = demo.querySelector('.code-display');
      const liveDemo = demo.querySelector('.live');
  
      if (template && codeDisplay && liveDemo) {
        // Get the raw content of the template (HTML + JS)
        const content = template.innerHTML.trim();
        
        // Display the code as text
        codeDisplay.textContent = content;
  
        // Clone and execute the snippet
        const clone = template.content.cloneNode(true);
        
        // Handle the <script> tag
        const script = clone.querySelector('script');
        if (script) {
          const newScript = document.createElement('script');
          newScript.type = 'module'; // Preserve module behavior
          newScript.textContent = script.textContent;
          document.body.appendChild(newScript); // Append to body to execute
          script.remove(); // Remove original script from clone to avoid duplication
        }
  
        // Append the remaining HTML to the live demo
        liveDemo.appendChild(clone);
      }
    });
  });