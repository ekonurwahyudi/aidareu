'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ProductWithActionsType = ProductType & {
  actions?: string
}

type ProductCategoryType = {
  [key: string]: {
    icon: string
    color: ThemeColor
  }
}

type productStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

// Custom filter
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Debounced input for search
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const productCategoryObj: ProductCategoryType = {
  Accessories: { icon: 'tabler-headphones', color: 'error' },
  'Home Decor': { icon: 'tabler-smart-home', color: 'info' },
  Electronics: { icon: 'tabler-device-laptop', color: 'primary' },
  Shoes: { icon: 'tabler-shoe', color: 'success' },
  Office: { icon: 'tabler-briefcase', color: 'warning' },
  Games: { icon: 'tabler-device-gamepad-2', color: 'secondary' }
}

const productStatusObj: productStatusType = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ProductWithActionsType>()

const ProductListTable = ({ productData }: { productData?: ProductType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[productData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')

  // New states for filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Effect to filter data
  useEffect(() => {
    let updated = [...(data || [])]

    if (statusFilter !== 'all') {
      updated = updated.filter(item => item.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      updated = updated.filter(item => item.category === categoryFilter)
    }

    setFilteredData(updated)
  }, [statusFilter, categoryFilter, data])

  // Columns
  const columns = useMemo<ColumnDef<ProductWithActionsType, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler()
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler()
          }}
        />
      )
    },
    columnHelper.accessor('productName', {
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <img src={row.original.image} width={38} height={38} className="rounded bg-actionHover" />
          <div className="flex flex-col">
            <Typography className="font-medium" color="text.primary">
              {row.original.productName}
            </Typography>
            <Typography variant="body2">{row.original.productBrand}</Typography>
          </div>
        </div>
      )
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <CustomAvatar skin="light" color={productCategoryObj[row.original.category].color} size={30}>
            <i className={classnames(productCategoryObj[row.original.category].icon, 'text-lg')} />
          </CustomAvatar>
          <Typography color="text.primary">{row.original.category}</Typography>
        </div>
      )
    }),
    columnHelper.accessor('price', {
      header: 'Harga Awal',
      cell: ({ row }) => <Typography>{row.original.price}</Typography>
    }),
    columnHelper.accessor('price', {
      header: 'Harga Diskon',
      cell: ({ row }) => <Typography>{row.original.price}</Typography>
    }),
    columnHelper.accessor('stock', {
      header: 'Status',
      cell: ({ row }) => <Switch defaultChecked={row.original.stock} />,
      enableSorting: false
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconButton>
            <i className="tabler-edit text-textSecondary" />
          </IconButton>
          <IconButton>
            <i className="tabler-trash text-textSecondary" />
          </IconButton>
        </div>
      ),
      enableSorting: false
    })
  ], [data, filteredData])

  // Table setup
  const table = useReactTable({
    data: filteredData as ProductType[],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      {/* Header: title kiri, tombol kanan */}
      <CardHeader
        title="My Products"
        action={
          <div className="flex gap-3">
            <Button color="success" variant="tonal" startIcon={<i className="tabler-file-excel" />}>
              Export
            </Button>
            <Button variant="contained" component={Link} href="/apps/tokoku/products/add" startIcon={<i className="tabler-plus" />}>
              Add Product
            </Button>
          </div>
        }
      />

      <Divider />

      {/* Filter Row */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-6">
        {/* Kiri bawah: Show entries */}
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="w-[80px]"
        >
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="25">25</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </CustomTextField>

        {/* Kanan bawah: Search + Filter */}
        <div className="flex gap-3 items-center">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={val => setGlobalFilter(String(val))}
            placeholder="Search Product"
            className="w-[200px]"
          />

          <CustomTextField select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-[150px]">
            <MenuItem value="all">All Status</MenuItem>
            {Object.keys(productStatusObj).map(s => (
              <MenuItem key={s} value={s}>{productStatusObj[s].title}</MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-[150px]">
            <MenuItem value="all">All Categories</MenuItem>
            {Object.keys(productCategoryObj).map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </CustomTextField>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className="tabler-chevron-up text-xl" />,
                          desc: <i className="tabler-chevron-down text-xl" />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
    </Card>
  )
}

export default ProductListTable