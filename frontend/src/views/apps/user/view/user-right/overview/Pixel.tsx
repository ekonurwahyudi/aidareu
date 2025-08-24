// React Imports
import type { ReactElement } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type DataType = {
  Keterangan: string
  convention: string
  pixel: string
  KodeTesting: string
  conventionIcon: ReactElement
}

// Vars
const recentKeteranganData: DataType[] = [
  {
    Keterangan: 'Facebook Pixel',
    pixel: '',
    convention: '',
    KodeTesting: '',
    conventionIcon: <i className='tabler-brand-facebook text-[22px] text-info' />
  },
  {
    Keterangan: 'Tiktok Pixel',
    pixel: '',
    convention: '',
    KodeTesting: '',
    conventionIcon: <i className='tabler-brand-tiktok text-[22px] text-success' />
  },
  {
    Keterangan: 'Google Tag Manager',
    pixel: '',
    convention: '',
    KodeTesting: '',
    conventionIcon: <i className='tabler-brand-google text-[22px] text-secondary' />
  }
]

const RecentKeterangan = () => {
  return (
    <Card>
      <CardHeader
        title="Setting Keterangan"
        subheader="Tambahkan Keterangan untuk Iklan yang Maximal."
        sx={{ pb: 1 }}
      />
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Keterangan</th>
              <th>Pixel Id</th>
              <th>Convention/Event</th>
              <th>Kode Testing</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {recentKeteranganData.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="flex items-center gap-4">
                    {item.conventionIcon}
                    <Typography color="text.primary">{item.Keterangan}</Typography>
                  </div>
                </td>
                <td>
                  <Typography>{item.pixel}</Typography>
                </td>
                <td>
                  <Typography>{item.convention}</Typography>
                </td>
                <td>
                  <Typography>{item.KodeTesting}</Typography>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Lihat">
                      <IconButton size="small" color="info">
                        <i className="tabler-eye" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="secondary">
                        <i className="tabler-edit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton size="small" color="error">
                        <i className="tabler-trash" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default RecentKeterangan
