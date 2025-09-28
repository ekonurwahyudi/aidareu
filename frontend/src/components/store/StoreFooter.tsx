'use client'

// MUI Imports
import { Box, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1F2937',
  color: 'white',
  padding: theme.spacing(3, 0),
  marginTop: 'auto'
}))

const StoreFooter = () => {
  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Made with ❤️ by Tunerra
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  )
}

export default StoreFooter