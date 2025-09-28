'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Badge
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Icon Imports
import CloseIcon from '@mui/icons-material/Close'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DeleteIcon from '@mui/icons-material/Delete'

const CartDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 380,
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100vw'
    }
  }
}))

interface CartItem {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  cartItems: CartItem[]
  onRemoveItem: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
}

const CartDrawerComponent = ({
  open,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity
}: CartDrawerProps) => {
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.salePrice || item.price
    return total + (price * item.quantity)
  }, 0)

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartDrawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon />
          Cart Saya
          <Badge badgeContent={totalItems} color="error" sx={{ ml: 1 }} />
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Keranjang Anda kosong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tambahkan produk untuk mulai berbelanja
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, maxHeight: 400, overflow: 'auto' }}>
            {cartItems.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={item.image}
                    sx={{ width: 56, height: 56, borderRadius: 2 }}
                    variant="rounded"
                  >
                    📦
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.salePrice ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#22C55E' }}>
                              Rp {item.salePrice.toLocaleString('id-ID')}
                            </Typography>
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                              Rp {item.price.toLocaleString('id-ID')}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Rp {item.price.toLocaleString('id-ID')}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          sx={{ minWidth: 30, width: 30, height: 30 }}
                        >
                          -
                        </Button>
                        <Typography variant="body2" sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          sx={{ minWidth: 30, width: 30, height: 30 }}
                        >
                          +
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => onRemoveItem(item.id)}
                          sx={{ ml: 'auto', color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E91E63' }}>
                Rp {totalPrice.toLocaleString('id-ID')}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: '#E91E63',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: 2,
                py: 1.5
              }}
            >
              Checkout ({totalItems} items)
            </Button>
          </Box>
        </>
      )}
    </CartDrawer>
  )
}

export default CartDrawerComponent