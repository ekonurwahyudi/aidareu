// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// Component Imports
import Form from '@components/Form'
import CustomTextField from '@core/components/mui/TextField'

const ProductPricing = () => {
  return (
    <Card>
      <CardHeader title='Harga Produk' />
      <CardContent>
        <Form>
          <CustomTextField fullWidth label='Harga Produk' placeholder='Rp. 100.000' className='mbe-6' />
          <CustomTextField fullWidth label='Diskon Harga' placeholder='Ro. 80.000' className='mbe-6' />
        </Form>
      </CardContent>
    </Card>
  )
}

export default ProductPricing
