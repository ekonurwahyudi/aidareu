'use client'

import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Canvas from './Canvas'
import EditableComponent from './EditableComponent'

interface EditorCanvasProps {
  viewMode: 'desktop' | 'mobile' | 'tablet'
  editedHtml: string
  components: any[]
  onUpdateComponent: (id: string, newData: any) => void
  onDeleteComponent: (id: string) => void
  onSelectComponent: (component: any) => void
  onAddComponent?: (type: string, dropTarget?: HTMLElement) => void
  onElementSelect?: (element: HTMLElement) => void
}

const EditorCanvas = ({
  viewMode,
  editedHtml,
  components,
  onUpdateComponent,
  onDeleteComponent,
  onSelectComponent,
  onAddComponent,
  onElementSelect
}: EditorCanvasProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const setupIframeHandlers = () => {
      const iframe = iframeRef.current;
      
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;
        
        // Add basic styles to iframe body when setting up handlers
        doc.head.innerHTML = `
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: system-ui;
            }
            .editor-component {
              border: 2px dashed #e0e0e0 !important;
              border-radius: 8px !important;
              position: relative;
              margin: 10px 0;
            }
            .editor-component:hover {
              border-color: #3b82f6 !important;
            }
            .selected-element {
              outline: 2px solid #8b5cf6 !important;
              outline-offset: 2px !important;
              background-color: rgba(139, 92, 246, 0.05) !important;
              z-index: 1000;
            }
            /* Ensure images display properly */
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            /* Make contenteditable elements more visible when focused */
            [contenteditable] {
              padding: 4px 6px;
              border-radius: 4px;
              min-width: 20px;
              display: inline-block;
            }
            [contenteditable]:focus {
              outline: 2px solid #8b5cf6 !important;
              outline-offset: 2px !important;
              background-color: rgba(139, 92, 246, 0.1) !important;
            }
            [contenteditable]:empty:before {
              content: "Click to edit...";
              color: #9ca3af;
              font-style: italic;
            }
            /* Prevent drag conflicts with editable elements */
            [contenteditable] img {
              pointer-events: none;
            }
          </style>
        `;
        
        // Set up click handler
        const handleClick = (e: Event) => {
          const target = e.target as HTMLElement;
          
          // Clear previous selections
          doc.querySelectorAll('.selected-element').forEach((el: any) => {
            el.classList.remove('selected-element');
          });
          
          // Select the clicked element if it's an editor component
          if (target && target.closest('.editor-component')) {
            const component = target.closest('.editor-component') as HTMLElement;
            component.classList.add('selected-element');
            if (onElementSelect) {
              onElementSelect(component);
            }
          }
        };
        
        // Handle content changes in editable elements
        const handleContentChange = (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.hasAttribute('contenteditable')) {
            // Debounce the update to avoid too frequent state changes
            clearTimeout((window as any).contentUpdateTimer);
            (window as any).contentUpdateTimer = setTimeout(() => {
              // Notify parent about content changes
              const event = new CustomEvent('contentChange', {
                detail: { html: doc.body.innerHTML }
              });
              window.dispatchEvent(event);
            }, 500);
          }
        };
        
        // Add input event listeners to all contenteditable elements
        const editableElements = doc.querySelectorAll('[contenteditable]');
        editableElements.forEach(el => {
          el.addEventListener('input', handleContentChange);
          el.addEventListener('blur', handleContentChange);
        });
        
        // Set up drag and drop handlers for iframe content
        const handleDragOver = (e: DragEvent) => {
          e.preventDefault();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
          }
        };
        
        const handleDrop = (e: DragEvent) => {
          e.preventDefault();
          if (e.dataTransfer) {
            const componentType = e.dataTransfer.getData('component-type');
            if (componentType && onAddComponent) {
              // Get the drop target element
              const dropTarget = e.target as HTMLElement;
              onAddComponent(componentType, dropTarget);
            }
          }
        };
        
        doc.addEventListener('click', handleClick);
        doc.addEventListener('dragover', handleDragOver);
        doc.addEventListener('drop', handleDrop);
        
        return () => {
          doc.removeEventListener('click', handleClick);
          doc.removeEventListener('dragover', handleDragOver);
          doc.removeEventListener('drop', handleDrop);
          
          // Clean up contenteditable event listeners
          editableElements.forEach(el => {
            el.removeEventListener('input', handleContentChange);
            el.removeEventListener('blur', handleContentChange);
          });
        };
      }
    };

    // Set up handlers after a short delay to ensure iframe is loaded
    const timer = setTimeout(setupIframeHandlers, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [editedHtml, onElementSelect, onAddComponent]);

  return (
    <Box sx={{ p: 2 }}>
      <Canvas className="min-h-[60vh]" onAddComponent={onAddComponent}>
        {/* Always render the iframe with edited HTML so drops merge into existing page */}
        {true ? (
          <Box sx={{ 
            width: '100%', 
            height: '150vh', 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pt: 2,
            bgcolor: 'background.default',
            transition: 'all 0.3s ease',
            overflowX: 'hidden'
          }}>
            <Box sx={{
              width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '1200px',
              maxWidth: '100%',
              height: '100%',
              mx: 'auto',
              border: viewMode !== 'desktop' ? '1px solid' : 'none',
              borderColor: viewMode !== 'desktop' ? 'divider' : 'transparent',
              borderRadius: viewMode !== 'desktop' ? 2 : 0,
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <iframe 
                ref={iframeRef}
                title="Landing Page Editor"
                srcDoc={editedHtml}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 'inherit'
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {components.map((component) => (
              <EditableComponent
                key={component.id}
                component={component}
                onUpdate={(newData) => onUpdateComponent(component.id, newData)}
                onDelete={() => onDeleteComponent(component.id)}
                onSelect={(comp) => onSelectComponent(comp)}
              />
            ))}
          </Box>
        )}
      </Canvas>
    </Box>
  )
}

export default EditorCanvas