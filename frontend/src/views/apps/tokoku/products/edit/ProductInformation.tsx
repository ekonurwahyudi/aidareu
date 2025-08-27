'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import classnames from 'classnames'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/core'

// Context Imports
import { useProductForm } from '@/contexts/ProductFormContext'

// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-6 pbe-4 pli-6'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className={classnames('tabler-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i className={classnames('tabler-align-center', { 'text-textSecondary': !editor.isActive({ textAlign: 'center' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i className={classnames('tabler-align-right', { 'text-textSecondary': !editor.isActive({ textAlign: 'right' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i className={classnames('tabler-align-justified', { 'text-textSecondary': !editor.isActive({ textAlign: 'justify' }) })} />
      </CustomIconButton>
    </div>
  )
}

const ProductInformation = () => {
  const { formData, setFormData, errors, setEditor } = useProductForm()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],
    immediatelyRender: false,
    content: `
      <p>
        Deskripsi produk singkat dan jelas tentang produk yang dijual.
      </p>
    `,
    onUpdate: ({ editor }) => {
      setFormData({ deskripsi: editor.getHTML() })
    }
  })

  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
  }, [editor, setEditor])

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ nama_produk: e.target.value })
  }

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jenis = e.target.value as 'digital' | 'fisik'
    setFormData({ 
      jenis_produk: jenis,
      url_produk: jenis === 'fisik' ? '' : formData.url_produk // Clear URL if switching to physical
    })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ url_produk: e.target.value })
  }

  return (
    <Card>
      <CardHeader title='Product Information' />
      <CardContent>
        <Grid container spacing={6} className='mbe-6'>
          <Grid size={{ xs: 12 }}>
            <CustomTextField 
              fullWidth 
              label='Nama Produk' 
              placeholder='Workshop Pintar untuk anak cerdas 12.000+' 
              value={formData.nama_produk}
              onChange={handleProductNameChange}
              error={!!errors.nama_produk}
            />
            {errors.nama_produk && (
              <FormHelperText error>{errors.nama_produk}</FormHelperText>
            )}
          </Grid>
        </Grid>
        <Typography className='mbe-1'>Deskripsi Produk (Optional)</Typography>
        <Card className='p-0 border shadow-none'>
          <CardContent className='p-0'>
            <EditorToolbar editor={editor} />
            <Divider className='mli-6' />
            <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex ' />
          </CardContent>
        </Card>
        <Grid container spacing={6} className='mbe-6 mt-4'>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              select
              fullWidth
              label='Jenis Produk'
              value={formData.jenis_produk}
              onChange={handleProductTypeChange}
            >
              <MenuItem value='digital'>Produk Digital</MenuItem>
              <MenuItem value='fisik'>Produk Fisik</MenuItem>
            </CustomTextField>
          </Grid>

          {/* Muncul hanya jika Produk Digital */}
          {formData.jenis_produk === 'digital' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField 
                fullWidth 
                label='Url Produk' 
                placeholder='https://www.tokoku.com' 
                value={formData.url_produk || ''}
                onChange={handleUrlChange}
                error={!!errors.url_produk}
              />
              {errors.url_produk && (
                <FormHelperText error>{errors.url_produk}</FormHelperText>
              )}
            </Grid>
          )}

          {/* Show stock field for physical products */}
          {formData.jenis_produk === 'fisik' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField 
                fullWidth 
                type="number"
                label='Stock' 
                placeholder='0' 
                value={formData.stock || ''}
                onChange={(e) => setFormData({ stock: parseInt(e.target.value) || 0 })}
                error={!!errors.stock}
              />
              {errors.stock && (
                <FormHelperText error>{errors.stock}</FormHelperText>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductInformation
