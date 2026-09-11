import re

with open('src/components/ExerciseBlock.svelte', 'r') as f:
    content = f.read()

# Fix the resize logic for West and North directions so that it clamps gracefully
old_logic = """      if (resizeDirection.includes('w')) {
          const possibleWidth = startWidth - dx;
          if (possibleWidth >= 350) {
              newWidth = possibleWidth;
              newX = startX + dx;
          }
      }
      if (resizeDirection.includes('n')) {
          const possibleHeight = startHeight - dy;
          if (possibleHeight >= 150) {
              newHeight = possibleHeight;
              newY = startY + dy;
          }
      }"""

new_logic = """      if (resizeDirection.includes('w')) {
          newWidth = Math.max(350, startWidth - dx);
          // Only adjust X by the amount the width actually changed
          newX = startX + (startWidth - newWidth);
      }
      if (resizeDirection.includes('n')) {
          newHeight = Math.max(150, startHeight - dy);
          // Only adjust Y by the amount the height actually changed
          newY = startY + (startHeight - newHeight);
      }"""

content = content.replace(old_logic, new_logic)

with open('src/components/ExerciseBlock.svelte', 'w') as f:
    f.write(content)
