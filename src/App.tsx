import { Routes, Route, Navigate } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Catalog from './screens/Catalog'
import Support from './screens/Support'
import Money from './screens/Money'
import Calls from './screens/Calls'
import CallSettings from './screens/CallSettings'
import CallsCatalog from './screens/CallsCatalog'
import SecretaryPromo from './screens/SecretaryPromo'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/support" element={<Support />} />
      <Route path="/money" element={<Money />} />
      <Route path="/calls" element={<Calls />} />
      <Route path="/calls/settings" element={<CallSettings />} />
      <Route path="/calls/catalog" element={<CallsCatalog />} />
      <Route path="/calls/secretary-promo" element={<SecretaryPromo />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
