// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const ProductAddHeader = () => {
  return (
    <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
      <div>
        <Typography variant='h4' className='mbe-1'>
          Tambah Produk
        </Typography>
        <Typography>Tambakan produk kamu disini</Typography>
      </div>
      <div className='flex flex-wrap max-sm:flex-col gap-4'>
        <Button variant='contained' color='primary' startIcon={<i className="tabler-chevrons-left" />}>
          Kembali
        </Button>
        <Button variant='tonal' color='warning' startIcon={<i className="tabler-file-plus" />}>
          Save Draft
        </Button>
        <Button variant='contained' color='success' startIcon={<i className="tabler-rocket" />}>
          Publish Product
        </Button>
      </div>
    </div>
  )
}

export default ProductAddHeader
