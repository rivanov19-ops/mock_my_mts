import { Routes, Route, Navigate } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Catalog from './screens/Catalog'
import Support from './screens/Support'
import Money from './screens/Money'
import Calls from './screens/Calls'
import CallsToBe from './screens/CallsToBe'
import CallSettings from './screens/CallSettings'
import CallsCatalog from './screens/CallsCatalog'
import SecretaryPromo from './screens/SecretaryPromo'
import SmartRecordingPromo from './screens/SmartRecordingPromo'
import SecretaryPlusPromo from './screens/SecretaryPlusPromo'
import NoiseReductionPromo from './screens/NoiseReductionPromo'
import SecretaryAnswers from './screens/SecretaryAnswers'
import VoiceTech from './screens/VoiceTech'
import VoiceTechAuth from './screens/VoiceTechAuth'

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
      <Route path="/calls/tobe" element={<CallsToBe />} />
      <Route path="/calls/settings" element={<CallSettings />} />
      <Route path="/calls/catalog" element={<CallsCatalog />} />
      <Route path="/calls/secretary-promo" element={<SecretaryPromo />} />
      <Route path="/calls/smart-recording-promo" element={<SmartRecordingPromo />} />
      <Route path="/calls/secretary-plus-promo" element={<SecretaryPlusPromo />} />
      <Route path="/calls/noise-reduction-promo" element={<NoiseReductionPromo />} />
      <Route path="/calls/secretary-answers" element={<SecretaryAnswers />} />
      <Route path="/voicetech" element={<VoiceTech />} />
      <Route path="/voicetech-auth" element={<VoiceTechAuth />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
