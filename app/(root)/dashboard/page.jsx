import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserData } from '@/modules/profile/actions'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const profileData = await getCurrentUserData();

    if (!profileData) {
        return redirect('/sign-in');
    }

    return <DashboardClient profileData={profileData} />
}
