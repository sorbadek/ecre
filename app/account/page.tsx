'use client'

import * as React from 'react'
import { RouteGuard } from '@/components/route-guard'
import AccountProfile from '@/components/account-profile'
import WatermarkBackground from '@/components/watermark-bg'

export default function AccountPage() {
  return (
    <RouteGuard>
      <WatermarkBackground>
        <div className="p-4 md:p-6">
          <AccountProfile />
        </div>
      </WatermarkBackground>
    </RouteGuard>
  )
}
