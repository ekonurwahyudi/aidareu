// Component Imports
import EcommerceDashboard from '../../apps/ecommerce/dashboard/page'
import StoreSetupChecker from '@components/store-setup/StoreSetupChecker'

const DashboardECommerce = () => {
  return (
    <StoreSetupChecker>
      <EcommerceDashboard />
    </StoreSetupChecker>
  )
}

export default DashboardECommerce
