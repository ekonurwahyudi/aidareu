'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

import TextField from '@mui/material/TextField'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { RgbaColorPicker, HexColorInput } from 'react-colorful'

import CustomIconButton from '@core/components/mui/IconButton'
import TiptapEditor from './TiptapEditor'
import Sidebar from './Sidebar'
import TopControlsBar from './TopControlsBar'
import EditorCanvas from './EditorCanvas'
import { generateHTMLFromData, generateCSSFromData, createComponentElement, getDefaultProps, cleanHtmlForViewing } from './utils/htmlGenerator'

// Using emoji icons for now - Material-UI icons package needs to be installed
// import EditIcon from '@mui/icons-material/Edit'
// ... other icon imports can be added later when package is available

// TypeScript interfaces for data structures
interface Store {
  uuid: string
  name: string
  subdomain: string
  domain?: string
  is_active: boolean
}

interface Domain {
  id: string
  domain?: string
  subdomain?: string
  store_uuid: string
}

interface PixelStore {
  uuid: string
  pixel_type: string
  nama_pixel: string
  pixel_id: string
  convention_event: string
  is_active: boolean
}

interface PageData {
  nama_halaman: string
  title_tag?: string
  slug: string
  store_uuid: string
  domain?: string
  subdomain?: string
  favicon?: File | null
  logo?: File | null
  meta_description: string
  keywords: string
  meta_image?: File | null
  facebook_pixel_uuid?: string
  tiktok_pixel_uuid?: string
  google_tag_manager_uuid?: string
}

const COMPONENT_TYPES = {
  TEXT: 'text',
  DYNAMIC_TEXT: 'dynamic_text', 
  BUTTON: 'button',
  IMAGE: 'image',
  FULL_WIDTH_IMAGE: 'full_width_image',
  VIDEO: 'video',
  CONTAINER: 'container',
  GRID: 'grid',
  HTML_CODE: 'html_code',
  HERO_HEADER: 'hero_header',
  SPOTLIGHT_TEXT: 'spotlight_text',
  FEATURE_HIGHLIGHT: 'feature_highlight'
}




interface VisualEditorProps {
  initialData?: {
    components?: any[]
    sections?: any[]
    html?: string
    css?: string
  }
  onSave?: (data: any) => void
  onManualSave?: (data?: any) => void
  saving?: boolean
  lastSaved?: Date | null
  onUndo?: () => void
  onRedo?: () => void
  onReset?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export default function VisualEditor({ initialData, onSave, onManualSave, saving, lastSaved, onUndo, onRedo, onReset, canUndo, canRedo }: VisualEditorProps) {
  const [components, setComponents] = useState(initialData?.components || [])
  const [sections, setSections] = useState(initialData?.sections || [])
  const [selectedTab, setSelectedTab] = useState(0) // 0: Components, 1: Properties, 2: Outline
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [editedHtml, setEditedHtml] = useState(initialData?.html || '<div style="text-align: center; padding: 40px; color: #6b7280; border: 2px dashed #e0e0e0; border-radius: 8px; margin: 20px;" class="editor-component" data-component-type="container"><h2>Welcome to Visual Editor</h2><p>Start by adding components from the sidebar</p><p style="font-size: 14px; margin-top: 20px; color: #9ca3af;">Drag and drop components here or click on them to add</p></div>')
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [selectedElementVersion, setSelectedElementVersion] = useState(0)
  const [lastScrollPosition, setLastScrollPosition] = useState({ top: 0, left: 0 })
  const [elementTree, setElementTree] = useState<any[]>([])
  const [draggedElement, setDraggedElement] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')
  const [isUpdatingContent, setIsUpdatingContent] = useState(false) // Track content updates
  // Local history for Undo/Redo inside the canvas (HTML snapshots)
  const [htmlHistory, setHtmlHistory] = useState<string[]>([initialData?.html || ''])
  const [historyIndex, setHistoryIndex] = useState<number>(0)
  const applyingHistoryRef = useRef<boolean>(false)

  // Original snapshot (first mount) for hard reset
  const originalSnapshotRef = useRef<string>(initialData?.html || '')
  
  // Real-time element outline tracking
  const [elementOutline, setElementOutline] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  // Accordion state management for Pengaturan tab
  const [expandedAccordion, setExpandedAccordion] = useState<string>('website') // Default expanded is 'website'
  
  // Page settings state
  const [pageSettings, setPageSettings] = useState({
    pageName: '',
    titleTag: '',
    slugUrl: '',
    selectedStore: '',
    selectedDomain: '',
    favicon: null as File | null,
    logo: null as File | null,
    metaDescription: '',
    keywords: '',
    metaImage: null as File | null,
    facebookPixel: '',
    tiktokPixel: '',
    googleTagManager: ''
  })

  // Data loading states
  const [stores, setStores] = useState<Store[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [pixels, setPixels] = useState<PixelStore[]>([])

  const [loading, setLoading] = useState({
    stores: false,
    domains: false,
    pixels: false,
    pageData: false
  })

  const [errors, setErrors] = useState<string[]>([])

  // Data loading functions
  const loadStores = async () => {
    try {
      setLoading(prev => ({ ...prev, stores: true }))
      setErrors([])
      
      const response = await fetch('/api/public/stores', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load stores')
      }
      
      const data = await response.json()

      // Handle the specific response format from public stores API
      const stores = data.stores || data.data || data || []

      setStores(stores)
    } catch (error) {
      console.error('Error loading stores:', error)
      setErrors(prev => [...prev, 'Failed to load stores'])
    } finally {
      setLoading(prev => ({ ...prev, stores: false }))
    }
  }

  const loadDomains = async (storeUuid: string) => {
    if (!storeUuid) {
      setDomains([])
      
return
    }

    try {
      setLoading(prev => ({ ...prev, domains: true }))
      
      // Find selected store to get domain info
      const selectedStore = stores.find(store => store.uuid === storeUuid)

      if (!selectedStore) return

      const domainList: Domain[] = []
      
      // Prioritize domain - if domain exists, only show that
      if (selectedStore.domain) {
        domainList.push({
          id: `domain-${selectedStore.uuid}`,
          domain: selectedStore.domain,
          store_uuid: selectedStore.uuid
        })
      } else if (selectedStore.subdomain) {
        // Only show subdomain if no domain exists
        domainList.push({
          id: `subdomain-${selectedStore.uuid}`,
          subdomain: selectedStore.subdomain,
          store_uuid: selectedStore.uuid
        })
      }
      
      setDomains(domainList)
    } catch (error) {
      console.error('Error loading domains:', error)
      setErrors(prev => [...prev, 'Failed to load domains'])
    } finally {
      setLoading(prev => ({ ...prev, domains: false }))
    }
  }

  const loadPixels = async (storeUuid: string) => {
    if (!storeUuid) {
      setPixels([])
      
return
    }

    try {
      setLoading(prev => ({ ...prev, pixels: true }))
      
      const response = await fetch(`/api/public/pixel-stores?store_uuid=${storeUuid}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load pixels')
      }
      
      const data = await response.json()

      setPixels(data.data || [])
    } catch (error) {
      console.error('Error loading pixels:', error)
      setErrors(prev => [...prev, 'Failed to load pixels'])
    } finally {
      setLoading(prev => ({ ...prev, pixels: false }))
    }
  }

  const loadPageData = async (pageId?: string) => {
    if (!pageId) return

    try {
      setLoading(prev => ({ ...prev, pageData: true }))
      
      const response = await fetch(`/api/landing-pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load page data')
      }
      
      const data = await response.json()
      const pageData = data.data
      
      // Update page settings with loaded data
      setPageSettings(prev => ({
        ...prev,
        pageName: pageData.nama_halaman || '',
        titleTag: pageData.title_tag || '',
        slugUrl: pageData.slug || '',
        selectedStore: pageData.store_uuid || '',
        selectedDomain: pageData.domain || pageData.subdomain || '',
        metaDescription: pageData.meta_description || '',
        keywords: pageData.keywords || '',
        facebookPixel: pageData.facebook_pixel_uuid || '',
        tiktokPixel: pageData.tiktok_pixel_uuid || '',
        googleTagManager: pageData.google_tag_manager_uuid || ''
      }))
      
    } catch (error) {
      console.error('Error loading page data:', error)
      setErrors(prev => [...prev, 'Failed to load page data'])
    } finally {
      setLoading(prev => ({ ...prev, pageData: false }))
    }
  }

  // Load initial data on component mount
  useEffect(() => {
    loadStores()
    
    // Load page data if editing existing page
    const urlParams = new URLSearchParams(window.location.search)
    const pageId = urlParams.get('id')

    if (pageId) {
      loadPageData(pageId)
    }
  }, [])

  // Load domains when store selection changes
  useEffect(() => {
    if (pageSettings.selectedStore) {
      loadDomains(pageSettings.selectedStore)
      loadPixels(pageSettings.selectedStore)
    } else {
      setDomains([])
      setPixels([])
      setPageSettings(prev => ({
        ...prev,
        selectedDomain: ''
      }))
    }
  }, [pageSettings.selectedStore])

  // Auto-select domain when domains are loaded and store is selected
  useEffect(() => {
    if (pageSettings.selectedStore && domains.length > 0) {
      const selectedStore = stores.find(store => store.uuid === pageSettings.selectedStore)

      if (selectedStore && domains.length === 1) {
        // Auto-select the first (and only) domain option
        setPageSettings(prev => ({
          ...prev,
          selectedDomain: domains[0].id
        }))
      }
    }
  }, [pageSettings.selectedStore, domains, stores])
  
  // Auto-select store if user only has one store
  useEffect(() => {
    if (stores.length === 1 && !pageSettings.selectedStore) {
      setPageSettings(prev => ({
        ...prev,
        selectedStore: stores[0].uuid
      }))
    }
  }, [stores, pageSettings.selectedStore])
  
  // Handle accordion expand/collapse - only one can be expanded at a time
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : '')
  }
  
  // Note: Store and domain data state declarations are above with proper TypeScript interfaces
  
  // Expanded outline items
  const [expandedOutlineItems, setExpandedOutlineItems] = useState<Set<string>>(new Set())
  
  // Unified Color Editor state (solid + gradient + alpha)
  const [colorEditorTab, setColorEditorTab] = useState<'solid' | 'gradient'>('solid')
  const [solidColor, setSolidColor] = useState<{ r: number; g: number; b: number; a: number }>({ r: 239, g: 64, b: 67, a: 1 })

  const [gradientStops, setGradientStops] = useState<Array<{ id: string; color: { r: number; g: number; b: number; a: number }; position: number }>>([
    { id: 'g1', color: { r: 239, g: 64, b: 67, a: 1 }, position: 0 },
    { id: 'g2', color: { r: 244, g: 63, b: 94, a: 1 }, position: 100 }
  ])

  const [activeStopId, setActiveStopId] = useState<string>('g1')
  const [gradientAngle, setGradientAngle] = useState<number>(135)
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')

  // Helpers for color formatting
  const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v))
  const rgbaToCss = (c: { r: number; g: number; b: number; a?: number }) => `rgba(${clamp(0, 255, Math.round(c.r))}, ${clamp(0, 255, Math.round(c.g))}, ${clamp(0, 255, Math.round(c.b))}, ${clamp(0, 1, typeof c.a === 'number' ? c.a : 1)})`

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => clamp(0, 255, Math.round(n)).toString(16).padStart(2, '0').toUpperCase()

    
return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const s = hex.trim().replace('#', '')

    if (s.length !== 6) return null
    const r = parseInt(s.slice(0, 2), 16)
    const g = parseInt(s.slice(2, 4), 16)
    const b = parseInt(s.slice(4, 6), 16)

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
    
return { r, g, b }
  }

  const applySolid = (c: { r: number; g: number; b: number; a: number }) => {
    if (!selectedElement?.style) return
    const css = rgbaToCss(c)

    selectedElement.style.backgroundColor = css as any
    selectedElement.style.background = ''
    selectedElement.style.backgroundImage = ''
    setEditedHtmlWithScrollPreservation(selectedElement.ownerDocument.body.innerHTML)
  }

  const applyGradient = (stops = gradientStops, angle = gradientAngle, type = gradientType) => {
    if (!selectedElement?.style) return
    const sorted = [...stops].sort((a, b) => a.position - b.position)
    const stopsCss = sorted.map(s => `${rgbaToCss(s.color)} ${clamp(0, 100, s.position)}%`).join(', ')
    const css = type === 'linear' ? `linear-gradient(${angle}deg, ${stopsCss})` : `radial-gradient(circle at center, ${stopsCss})`

    selectedElement.style.background = css as any
    selectedElement.style.backgroundImage = ''
    selectedElement.style.backgroundColor = ''
    setEditedHtmlWithScrollPreservation(selectedElement.ownerDocument.body.innerHTML)
  }
  
  
  // Auto-update outline when HTML changes
  useEffect(() => {
    if (editedHtml) {
      const timer = setTimeout(() => {
        updateElementOutline();
      }, 300);

      
return () => clearTimeout(timer);
    }
  }, [editedHtml]);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any created object URLs when component unmounts
      if (pageSettings.favicon) {
        const url = URL.createObjectURL(pageSettings.favicon)

        URL.revokeObjectURL(url)
      }

      if (pageSettings.logo) {
        const url = URL.createObjectURL(pageSettings.logo)

        URL.revokeObjectURL(url)
      }

      if (pageSettings.metaImage) {
        const url = URL.createObjectURL(pageSettings.metaImage)

        URL.revokeObjectURL(url)
      }
    }
  }, [pageSettings.favicon, pageSettings.logo, pageSettings.metaImage])

  // Auto-generate slug from page name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()

      // Replace Indonesian characters
      .replace(/[àáäâèéëêìíïîòóöôùúüûñç]/g, (match) => {
        const map: { [key: string]: string } = {
          'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a',
          'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e',
          'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i',
          'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o',
          'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u',
          'ñ': 'n', 'ç': 'c'
        }

        
return map[match] || match
      })
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Handle page name change and auto-generate slug
  const handlePageNameChange = (name: string) => {
    const newSlug = generateSlug(name)

    setPageSettings(prev => ({
      ...prev,
      pageName: name,
      slugUrl: newSlug,

      // Set titleTag to pageName if titleTag is empty
      titleTag: prev.titleTag || name
    }))
  }

  // Get preview URL based on selected store and domain
  const getPreviewUrl = () => {
    if (!pageSettings.selectedStore || !pageSettings.slugUrl) return ''
    
    const selectedStore = stores.find(store => store.uuid === pageSettings.selectedStore)

    if (!selectedStore) return ''
    
    // Use domain if available, otherwise use subdomain
    if (selectedStore.domain) {
      return `https://${selectedStore.domain}/${pageSettings.slugUrl}`
    } else if (selectedStore.subdomain) {
      return `https://${selectedStore.subdomain}.aidareu.com/${pageSettings.slugUrl}`
    }
    
    return ''
  }

  // Get full page URL for Google Search preview
  const getFullPageUrl = () => {
    if (!pageSettings.selectedStore || !pageSettings.slugUrl) return 'https://example.com/page'
    
    const selectedStore = stores.find(store => store.uuid === pageSettings.selectedStore)

    if (!selectedStore) return 'https://example.com/page'
    
    // Use domain if available, otherwise use subdomain
    if (selectedStore.domain) {
      return `https://${selectedStore.domain}/${pageSettings.slugUrl}`
    } else if (selectedStore.subdomain) {
      return `https://${selectedStore.subdomain}.aidareu.com/${pageSettings.slugUrl}`
    }
    
    return 'https://example.com/page'
  }

  // File upload validation
  const validateImageFile = (file: File, maxSize = 2) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSizeBytes = maxSize * 1024 * 1024 // Convert MB to bytes
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      
return false
    }
    
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSize}MB`)
      
return false
    }
    
    return true
  }

  // Push to local undo history whenever editedHtml changes (user edits)
  useEffect(() => {
    if (applyingHistoryRef.current) return
    setHtmlHistory(prev => {
      const current = prev[historyIndex]

      if (current === editedHtml) return prev
      const next = prev.slice(0, historyIndex + 1)

      next.push(editedHtml)
      setHistoryIndex(next.length - 1)
      
return next
    })

    // Keep parent informed (so server-side autosave & external buttons still reflect)
    onSave?.({ components: [], sections: [], html: editedHtml, css: initialData?.css || '' })
  }, [editedHtml])

  const applyHtmlToIframe = (html: string) => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement

    if (iframe?.contentWindow) {
      // Save current scroll position before applying HTML
      setLastScrollPosition({
        top: iframe.contentWindow.scrollY || 0,
        left: iframe.contentWindow.scrollX || 0
      });
    }

    setEditedHtml(html)

    if (iframe?.contentDocument) {
      iframe.contentDocument.body.innerHTML = html
      updateElementOutline()
    }
  }

  const handleLocalUndo = () => {
    if (historyIndex <= 0) return
    applyingHistoryRef.current = true
    const newIndex = historyIndex - 1

    setHistoryIndex(newIndex)
    const html = htmlHistory[newIndex]

    applyHtmlToIframe(html)
    applyingHistoryRef.current = false
    onUndo?.()
  }

  const handleLocalRedo = () => {
    if (historyIndex >= htmlHistory.length - 1) return
    applyingHistoryRef.current = true
    const newIndex = historyIndex + 1

    setHistoryIndex(newIndex)
    const html = htmlHistory[newIndex]

    applyHtmlToIframe(html)
    applyingHistoryRef.current = false
    onRedo?.()
  }

  const handleLocalReset = () => {
    applyingHistoryRef.current = true
    const html = originalSnapshotRef.current || ''

    applyHtmlToIframe(html)
    setHtmlHistory([html])
    setHistoryIndex(0)
    applyingHistoryRef.current = false
    onReset?.()
  }
  
  // Auto-save when content changes
  useEffect(() => {
    if (editedHtml || components.length > 0) {
      const timer = setTimeout(() => {
        let htmlToSave = editedHtml && editedHtml.trim() !== '' ? editedHtml : generateHTMLFromData(components, sections)
        
        // Clean HTML for viewing (remove editor-specific styling)
        htmlToSave = cleanHtmlForViewing(htmlToSave)
        
        const data = { 
          components, 
          sections,
          html: htmlToSave,
          css: initialData?.css || generateCSSFromData(components, sections)
        }

        onSave?.(data)
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [editedHtml, components, sections]);
  
  // Listen for content changes from iframe
  useEffect(() => {
    const handleContentChange = (e: CustomEvent) => {
      const newHtml = e.detail.html;
      if (newHtml !== editedHtml) {
        setEditedHtmlWithScrollPreservation(newHtml);
      }
    };

    window.addEventListener('contentChange', handleContentChange as EventListener);
    
    return () => {
      window.removeEventListener('contentChange', handleContentChange as EventListener);
    };
  }, [editedHtml]);
  
  // Update iframe content when editedHtml changes without scroll interference
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe && iframe.contentDocument && editedHtml) {
      const doc = iframe.contentDocument;

      if (doc.body && doc.body.innerHTML !== editedHtml) {
        // Add basic styles to iframe body
        doc.head.innerHTML = `
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            ${(initialData && (initialData as any).css) ? (initialData as any).css : ''}
            body { 
              margin: 0; 
              padding: 0; 
              font-family: system-ui;
            }
            .editor-component {
              border: 2px dashed #e0e0e0 !important;
              border-radius: 8px !important;
              position: relative;
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
            /* Ensure images display properly without transparency grid */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              background: transparent !important;
            }
            /* Full width images */
            .editor-component[data-component-type="full_width_image"] {
              width: 100% !important;
              margin: 20px 0 !important;
              padding: 0 !important;
            }
            .editor-component[data-component-type="full_width_image"] img {
              width: 100% !important;
              height: auto !important;
              object-fit: cover;
              border-radius: 0;
            }
            /* Regular images */
            .editor-component[data-component-type="image"] img {
              max-width: 100%;
              height: auto;
            }
            /* Drag and drop indicators */
            .drop-indicator {
              position: absolute;
              height: 2px;
              background: #8b5cf6;
              width: 100%;
              z-index: 1001;
            }
            .drop-indicator-top {
              top: 0;
              left: 0;
            }
            .drop-indicator-bottom {
              bottom: 0;
              left: 0;
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
        
        // Update content without any scroll manipulation
        doc.body.innerHTML = editedHtml;
        
        // Set up event handlers for content editing
        const handleContentChange = (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.hasAttribute('contenteditable')) {
            // Debounce the update to avoid too frequent state changes
            clearTimeout((window as any).contentUpdateTimer);
            (window as any).contentUpdateTimer = setTimeout(() => {
              setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
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
            if (componentType && handleAddComponent) {
              // Get the drop target element
              const dropTarget = e.target as HTMLElement;
              handleAddComponent(componentType, dropTarget);
            }
          }
        };
        
        doc.addEventListener('dragover', handleDragOver);
        doc.addEventListener('drop', handleDrop);
        
        updateElementOutline();
      }
    }
    
    // Clean up event listeners
    return () => {
      const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;
        doc.removeEventListener('dragover', () => {});
        doc.removeEventListener('drop', () => {});
        
        // Clean up contenteditable event listeners
        const editableElements = doc.querySelectorAll('[contenteditable]');
        editableElements.forEach(el => {
          el.removeEventListener('input', () => {});
          el.removeEventListener('blur', () => {});
        });
      }
    };
  }, [editedHtml, initialData]); // Removed handleAddComponent and updateElementOutline to avoid circular dependencies

  // Re-attach handles after updates so properties panel sees latest values
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      const curr = doc.querySelector('.selected-element') as HTMLElement | null;

      if (curr) {
        // Ensure inline styles reflect layout box
        const rect = curr.getBoundingClientRect();

        (curr as any).style.width = rect.width + 'px';
        (curr as any).style.height = rect.height + 'px';
      }
    }
  }, [selectedElementVersion]);
  
  const addNewSection = () => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const newContainer = doc.createElement('div');

      newContainer.className = 'editor-container';
      newContainer.innerHTML = '<h2>New Container</h2><p>Click to edit content or drag components here</p>';
      newContainer.style.padding = '40px 20px';
      newContainer.style.margin = '20px 0';
      newContainer.style.border = '2px dashed #ccc';
      newContainer.style.borderRadius = '8px';
      newContainer.style.minHeight = '150px';
      doc.body.appendChild(newContainer);
      setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
      updateElementOutline();
    }
  };
  
  const updateElementOutline = () => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const body = doc.body;
      const outline: any[] = [];
      
      // Parse body children as main sections
      Array.from(body.children).forEach((child: any, index) => {
        if (child.tagName && !child.classList.contains('element-controls')) {
          const section = {
            id: `section-${index}`,
            element: child,
            tagName: child.tagName.toLowerCase(),
            textContent: getElementPreview(child),
            isSection: ['section', 'div', 'article', 'aside', 'header', 'footer'].includes(child.tagName.toLowerCase()),
            children: [] as any[]
          };
          
          // Parse children elements recursively for better nesting
          const parseChildren = (parentElement: any, parentSection: any, depth = 0) => {
            if (depth > 3) return; // Limit depth to prevent infinite recursion
            
            Array.from(parentElement.children).forEach((childElement: any, childIndex) => {
              if (childElement.tagName && !childElement.classList.contains('element-controls')) {
                const childItem = {
                  id: `element-${index}-${childIndex}-${depth}`,
                  element: childElement,
                  tagName: childElement.tagName.toLowerCase(),
                  textContent: getElementPreview(childElement),
                  isSection: ['section', 'div', 'article', 'aside', 'header', 'footer'].includes(childElement.tagName.toLowerCase()),
                  parentSection: parentSection,
                  children: [] as any[]
                };
                
                parentSection.children.push(childItem);
                
                // Recursively parse children
                parseChildren(childElement, childItem, depth + 1);
              }
            });
          };
          
          parseChildren(child, section);
          
          outline.push(section);
        }
      });
      
      setElementOutline(outline);
      
      // Auto-expand sections with children on first load
      if (expandedSections.size === 0) {
        const newExpanded = new Set<string>();

        outline.forEach(section => {
          if (section.children.length > 0) {
            newExpanded.add(section.id);
            // Also expand first level children
            section.children.forEach((child: any) => {
              if (child.children && child.children.length > 0) {
                newExpanded.add(child.id);
              }
            });
          }
        });
        setExpandedSections(newExpanded);
      }
    }
  };
  
  const getElementPreview = (element: any) => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() || '';

    if (text.length > 30) {
      return text.substring(0, 30) + '...';
    }

    
return text || element.tagName.toLowerCase();
  };
  
  const getElementIcon = (tagName: string) => {
    const icons: any = {
      'section': '📦',
      'div': '📦', 
      'header': '🔝',
      'footer': '🔗',
      'h1': 'T', 'h2': 'T', 'h3': 'T', 'h4': 'T', 'h5': 'T', 'h6': 'T',
      'p': 'T',
      'img': '🖼️',
      'a': '🔗',
      'button': '🔘',
      'span': 'T',
      'article': '📄',
      'aside': '📋'
    };

    
return icons[tagName] || '📦';
  };

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);

    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }

    setExpandedSections(newExpanded);
  };

  const handleElementAction = (element: any, action: 'select' | 'duplicate' | 'delete') => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const targetElement = element.element;
      
      switch(action) {
        case 'select':
          // Clear previous selections
          doc.querySelectorAll('.selected-element').forEach((el: any) => {
            el.classList.remove('selected-element');
          });

          // Select element
          targetElement.classList.add('selected-element');
          setSelectedElement(targetElement);
          setSelectedTab(1); // Switch to Design/Properties tab
          
          // Update selected element version to trigger re-render
          setSelectedElementVersion(prev => prev + 1);
          break;
          
        case 'duplicate':
          const clone = targetElement.cloneNode(true);

          // Remove any controls from clone
          const controls = clone.querySelectorAll('.element-controls');

          controls.forEach((control: any) => control.remove());
          
          targetElement.parentNode.insertBefore(clone, targetElement.nextSibling);
          setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
          updateElementOutline();
          break;
          
        case 'delete':
          if (confirm(`Delete ${element.tagName.toUpperCase()} element?`)) {
            targetElement.remove();
            setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
            updateElementOutline();

            // Clear selection if deleted element was selected
            if (selectedElement === targetElement) {
              setSelectedElement(null);
            }
          }

          break;
      }
    }
  };
  
  const handleElementDrag = (element: any, targetElement: any, position: 'before' | 'after' | 'inside') => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument && element.element && targetElement.element) {
      const doc = iframe.contentDocument;
      const draggedEl = element.element;
      const targetEl = targetElement.element;
      
      // Verify elements are still in the DOM
      if (!doc.body.contains(draggedEl) || !doc.body.contains(targetEl)) {
        console.warn('Element not found in document');
        return;
      }
      
      // Remove from current position
      draggedEl.remove();
      
      // Insert at new position
      try {
        if (position === 'before') {
          targetEl.parentNode?.insertBefore(draggedEl, targetEl);
        } else if (position === 'after') {
          targetEl.parentNode?.insertBefore(draggedEl, targetEl.nextSibling);
        } else if (position === 'inside') {
          targetEl.appendChild(draggedEl);
        }
      } catch (error) {
        console.error('Error during drag and drop:', error);
        // Re-append to body as fallback
        doc.body.appendChild(draggedEl);
      }
      
      setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
      updateElementOutline();
    }
  };
  
  const renderElementOutline = () => {
    const renderOutlineItem = (item: any, depth = 0) => {
      const isExpanded = expandedSections.has(item.id);
      const hasChildren = item.children && item.children.length > 0;
      
      return (
        <Box key={item.id} sx={{ mb: 0.5 }}>
          {/* Element Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: selectedElement === item.element ? 'rgba(139, 92, 246, 0.1)' : 'white',
              '&:hover': {
                bgcolor: 'rgba(139, 92, 246, 0.05)',
                borderColor: '#8b5cf6',
                '& .element-actions': { opacity: 1 }
              }
            }}
          >
            {/* Expand/Collapse Button */}
            <Box
              onClick={(e) => {
                e.stopPropagation();

                if (hasChildren) {
                  toggleSectionExpanded(item.id);
                }
              }}
              sx={{
                fontSize: '12px',
                color: '#8b5cf6',
                minWidth: '16px',
                cursor: hasChildren ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
            </Box>
            
            {/* Drag Handle */}
            <Box
              draggable
              onDragStart={() => setDraggedElement(item)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();

                if (draggedElement && draggedElement.id !== item.id) {
                  handleElementDrag(draggedElement, item, 'before');
                }

                setDraggedElement(null);
              }}
              sx={{ fontSize: '10px', color: '#ccc', cursor: 'move', minWidth: '16px' }}
            >
              ⋮⋮
            </Box>
            
            {/* Element Icon */}
            <Box sx={{ fontSize: '14px', minWidth: '20px' }}>
              {getElementIcon(item.tagName)}
            </Box>
            
            {/* Element Info */}
            <Box
              onClick={() => {
                setSelectedElement(item.element);
                setSelectedTab(1);
              }}
              sx={{ flex: 1, fontSize: '13px', cursor: 'pointer' }}
            >
              <Box sx={{ fontWeight: 'bold', color: depth === 0 ? '#8b5cf6' : '#666' }}>
                {item.tagName.toUpperCase()}
                {hasChildren && (
                  <span style={{ fontSize: '10px', color: '#999', marginLeft: '8px' }}>
                    ({item.children.length} children)
                  </span>
                )}
              </Box>
              <Box sx={{ fontSize: '11px', color: '#666', mt: 0.5 }}>
                {item.textContent}
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Box 
              className="element-actions"
              sx={{ 
                display: 'flex', 
                gap: 0.5, 
                opacity: 0, 
                transition: 'opacity 0.2s',
                alignItems: 'center'
              }}
            >
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementAction(item, 'select');
                }}
                sx={{ 
                  minWidth: '24px', 
                  width: '24px', 
                  height: '24px', 
                  fontSize: '10px',
                  bgcolor: '#8b5cf6',
                  color: 'white',
                  '&:hover': { bgcolor: '#7c3aed' }
                }}
              >
                🎯
              </Button>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementAction(item, 'duplicate');
                }}
                sx={{ 
                  minWidth: '24px', 
                  width: '24px', 
                  height: '24px', 
                  fontSize: '10px',
                  bgcolor: '#059669',
                  color: 'white',
                  '&:hover': { bgcolor: '#047857' }
                }}
              >
                📋
              </Button>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementAction(item, 'delete');
                }}
                sx={{ 
                  minWidth: '24px', 
                  width: '24px', 
                  height: '24px', 
                  fontSize: '10px',
                  bgcolor: '#dc2626',
                  color: 'white',
                  '&:hover': { bgcolor: '#b91c1c' }
                }}
              >
                🗑️
              </Button>
            </Box>
          </Box>
          
          {/* Children - Only show if expanded */}
          {isExpanded && hasChildren && (
            <Box sx={{ ml: 3, mt: 0.5 }}>
              {item.children.map((child: any) => renderOutlineItem(child, depth + 1))}
            </Box>
          )}
        </Box>
      );
    };
    
    return elementOutline.map((section) => renderOutlineItem(section));
  };
  
  const updateElementTree = () => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const elements = doc.querySelectorAll('div, section, header, footer, article, aside');

      const treeData = Array.from(elements).map((el: any, index) => ({
        id: `element-${index}`,
        element: el,
        tagName: el.tagName.toLowerCase(),
        textContent: el.textContent?.substring(0, 50) + (el.textContent?.length > 50 ? '...' : ''),
        classes: el.className,
        children: el.children.length
      }));

      setElementTree(treeData);
      
      // Update the element tree UI
      const treeContainer = document.getElementById('element-tree');

      if (treeContainer) {
        treeContainer.innerHTML = '';
        treeData.forEach((item, index) => {
          const elementCard = document.createElement('div');

          elementCard.style.cssText = `
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
          `;
          
          elementCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #8b5cf6;">${item.tagName}</strong>
                <span style="color: #666; font-size: 12px; margin-left: 8px;">${item.children} children</span>
                <div style="color: #999; font-size: 11px; margin-top: 4px;">${item.textContent}</div>
              </div>
              <div style="display: flex; gap: 4px;">
                <button data-action="select" data-index="${index}" style="background: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Select</button>
                <button data-action="duplicate" data-index="${index}" style="background: #059669; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Copy</button>
                <button data-action="delete" data-index="${index}" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Delete</button>
              </div>
            </div>
          `;
          
          // Add event listeners for buttons
          elementCard.addEventListener('click', (e: any) => {
            const action = e.target.dataset.action;
            const index = e.target.dataset.index;

            if (action && index) {
              handleElementTreeAction(treeData[parseInt(index)], action);
            }
          });
          
          treeContainer.appendChild(elementCard);
        });
      }
    }
  };

  const handleElementTreeAction = (item: any, action: string) => {
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const element = item.element;
      
      switch(action) {
        case 'select':
          // Clear previous selections
          doc.querySelectorAll('.selected-element').forEach((el: any) => {
            el.classList.remove('selected-element');
          });

          // Select element
          element.classList.add('selected-element');
          setSelectedElement(element);
          setSelectedTab(1); // Switch to Properties tab
          break;
          
        case 'duplicate':
          const clone = element.cloneNode(true);

          element.parentNode.insertBefore(clone, element.nextSibling);
          setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
          updateElementTree(); // Refresh tree
          break;
          
        case 'delete':
          if (confirm(`Delete ${item.tagName} element?`)) {
            element.remove();
            setEditedHtmlWithScrollPreservation(doc.body.innerHTML);
            updateElementTree(); // Refresh tree

            // Clear selection if deleted element was selected
            if (selectedElement === element) {
              setSelectedElement(null);
            }
          }

          break;
      }
    }
  };

  const standardComponents = [
    { type: COMPONENT_TYPES.TEXT, label: 'Text Block', icon: 'tabler-file-text' },
    { type: COMPONENT_TYPES.DYNAMIC_TEXT, label: 'Heading', icon: 'tabler-heading' },
    { type: COMPONENT_TYPES.BUTTON, label: 'Button', icon: 'tabler-square-rounded' },
    { type: COMPONENT_TYPES.IMAGE, label: 'Image', icon: 'tabler-photo' },
    { type: COMPONENT_TYPES.FULL_WIDTH_IMAGE, label: 'Cover Image', icon: 'tabler-photo-filled' },
    { type: COMPONENT_TYPES.VIDEO, label: 'Video', icon: 'tabler-video' },
    { type: COMPONENT_TYPES.CONTAINER, label: 'Container', icon: 'tabler-layout' },
    { type: COMPONENT_TYPES.GRID, label: 'Columns', icon: 'tabler-columns' },
    { type: 'divider', label: 'Divider', icon: 'tabler-separator-horizontal' },
    { type: 'spacer', label: 'Spacer', icon: 'tabler-space' }
  ]

  const layoutComponents = [
    { type: COMPONENT_TYPES.HERO_HEADER, label: 'Hero Header', icon: 'tabler-trophy' },
    { type: COMPONENT_TYPES.SPOTLIGHT_TEXT, label: 'Spotlight Text', icon: 'tabler-bulb' },
    { type: COMPONENT_TYPES.FEATURE_HIGHLIGHT, label: 'Feature Highlight', icon: 'tabler-star' }
  ]

  const businessComponents = [
    { type: 'contact_form', label: 'Contact Form', icon: 'tabler-mail' },
    { type: 'testimonial', label: 'Testimonial', icon: 'tabler-message-2' },
    { type: 'pricing_card', label: 'Pricing Card', icon: 'tabler-tag' },
    { type: 'team_member', label: 'Team Member', icon: 'tabler-user' },
    { type: 'faq', label: 'FAQ', icon: 'tabler-help' },
    { type: 'newsletter', label: 'Newsletter', icon: 'tabler-news' },
    { type: 'stats', label: 'Statistics', icon: 'tabler-chart-bar' },
    { type: 'features', label: 'Features Grid', icon: 'tabler-grid-dots' },
    { type: 'social_links', label: 'Social Links', icon: 'tabler-link' },
    { type: 'call_to_action', label: 'Call to Action', icon: 'tabler-speakerphone' }
  ]

  const handleAddComponent = useCallback((type: string, dropTarget?: HTMLElement) => {
    // Always add directly to iframe HTML so it merges with existing landing page
    
    // Otherwise, add directly to iframe HTML (new system)
    const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      const newElement = createComponentElement(type);
      
      // Add data attributes for better identification
      newElement.dataset.componentId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        if (dropTarget && doc.body.contains(dropTarget)) {
          // Insert after the drop target
          dropTarget.parentNode?.insertBefore(newElement, dropTarget.nextSibling);
        } else {
          // Append to body if no specific target
          doc.body.appendChild(newElement);
        }
      } catch (error) {
        console.error('Error adding component:', error);
        // Fallback: append to body
        doc.body.appendChild(newElement);
      }
      
      // Update both HTML and components state
      const updatedHtml = doc.body.innerHTML;

      setEditedHtmlWithScrollPreservation(updatedHtml);
      updateElementOutline();
      
      // Force manual update of iframe if needed
      setTimeout(() => {
        const checkIframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement;

        if (checkIframe?.contentDocument) {
          const checkDoc = checkIframe.contentDocument;

          if (checkDoc.body.innerHTML !== updatedHtml) {
            checkDoc.body.innerHTML = updatedHtml;
          }
        }
      }, 100);

      // Do not push into components array to avoid placeholder canvas mode
    }
  }, [components])



  // Helper function to update HTML without scroll interference
  const setEditedHtmlWithScrollPreservation = (newHtml: string) => {
    // Simply update HTML content without any scroll preservation
    // This allows natural scrolling behavior without interference
    setEditedHtml(newHtml);
  }

  const updateComponent = (id: string, newData: any) => {
    setComponents(prev => prev.map(comp => comp.id === id ? { ...comp, ...newData } : comp))
  }

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
  }

  const handleSave = () => {
    let htmlToSave = editedHtml && editedHtml.trim() !== '' ? editedHtml : generateHTMLFromData(components, sections)
    
    // Clean HTML for viewing (remove editor-specific styling)
    htmlToSave = cleanHtmlForViewing(htmlToSave)
    
    const data = { 
      components, 
      sections,
      html: htmlToSave,
      css: initialData?.css || generateCSSFromData(components, sections)
    }

    onSave?.(data)
  }



  return (
    <Box sx={{ display: 'flex', minHeight: '80vh', bgcolor: 'background.paper' }}>
      {/* Sidebar - Conditional Rendering */}
      <Sidebar
        selectedTab={selectedTab}
        onTabChange={(event, value) => setSelectedTab(value)}
        drawerOpen={drawerOpen}
        
        // ComponentsTab props
        standardComponents={standardComponents}
        layoutComponents={layoutComponents}
        businessComponents={businessComponents}
        onAddComponent={handleAddComponent}
        
        // PropertiesTab props
        selectedElement={selectedElement}
        selectedComponent={selectedComponent}
        colorEditorTab={colorEditorTab}
        onColorEditorTabChange={setColorEditorTab}
        solidColor={solidColor}
        onSolidColorChange={setSolidColor}
        gradientStops={gradientStops}
        onGradientStopsChange={setGradientStops}
        activeStopId={activeStopId}
        onActiveStopIdChange={setActiveStopId}
        gradientAngle={gradientAngle}
        onGradientAngleChange={setGradientAngle}
        gradientType={gradientType}
        onGradientTypeChange={setGradientType}
        onApplySolid={applySolid}
        onApplyGradient={applyGradient}
        onEditedHtmlChange={setEditedHtmlWithScrollPreservation}
        selectedElementVersion={selectedElementVersion}
        onSelectedElementVersionChange={setSelectedElementVersion}
        onUpdateComponent={(id, data) => {
          const updated = components.map(c => c.id === id ? { ...c, ...data } : c)
          setComponents(updated)
        }}
        onSelectedComponentChange={setSelectedComponent}
        onClearSelection={() => {
          setSelectedElement(null)
          setSelectedComponent(null)
          const iframe = document.querySelector('iframe[title="Landing Page Editor"]') as HTMLIFrameElement
          if (iframe?.contentDocument) {
            iframe.contentDocument.querySelectorAll('.selected-element').forEach((el: any) => {
              el.classList.remove('selected-element')
              el.querySelectorAll('.ve-resize-handle, .ve-drag-handle').forEach((h: any) => h.remove())
            })
          }
        }}
        
        // SettingsTab props
        expandedAccordion={expandedAccordion}
        onAccordionChange={handleAccordionChange}
        pageSettings={pageSettings}
        onPageSettingsChange={setPageSettings}
        stores={stores}
        domains={domains}
        pixels={pixels}
        loading={loading}
        errors={errors}
        onPageNameChange={handlePageNameChange}
        getPreviewUrl={getPreviewUrl}
        getFullPageUrl={getFullPageUrl}
        validateImageFile={validateImageFile}
        elementOutline={elementOutline}
        renderElementOutline={renderElementOutline}
        onAddNewSection={addNewSection}
      />

      {/* Main Editor Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        minWidth: 0, // Prevents flex item from overflowing
        transition: 'all 0.3s ease'
      }}>
        <TopControlsBar
          drawerOpen={drawerOpen}
          onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
          onAdvancedEdit={() => {
            // Convert to component mode for advanced editing
            setComponents([{
              id: 'existing-content',
              type: 'html_content',
              content: initialData?.html || ''
            }])
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          historyIndex={historyIndex}
          htmlHistoryLength={htmlHistory.length}
          onUndo={handleLocalUndo}
          onRedo={handleLocalRedo}
          onReset={handleLocalReset}
          saving={saving}
          onManualSave={onManualSave}
        />

        <EditorCanvas
          viewMode={viewMode}
          editedHtml={editedHtml}
          components={components}
          onUpdateComponent={updateComponent}
          onDeleteComponent={deleteComponent}
          onSelectComponent={setSelectedComponent}
          onAddComponent={handleAddComponent}
          onElementSelect={setSelectedElement}
        />
      </Box>


    </Box>
  )
}
