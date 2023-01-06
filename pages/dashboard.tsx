import classNames from 'classnames'
import { useState } from 'react'
import { Tab } from '@headlessui/react'
import Layout from '../components/layout/Layout'
import { Activity, Config, Overview, Usage } from '../components/dashboard'

type Dashboard = {
  header: string
  content: JSX.Element | JSX.Element[]
}

export default function Dashboard() {
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)
  const dashboardNav: Dashboard[] = [
    { header: 'Overview', content: <Overview /> },
    { header: 'Activity', content: <Activity /> },
    { header: 'Usage', content: <Usage /> },
    { header: 'Config', content: <Config /> },
  ]

  return (
    <Layout location="Dashboard">
      {/* Dashboard Navigation */}
      <Tab.Group selectedIndex={selectedTabIdx} onChange={setSelectedTabIdx}>
        <Tab.List className="flex items-center justify-start gap-x-4 bg-navy px-4 pt-2 pb-4 text-white border-b border-gray-400">
          {dashboardNav.map((item, itemIdx) => (
            <Tab
              key={`internal-nav-${itemIdx}`}
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  'rounded px-2.5 py-1 transition-all hover:bg-primary/10 hover:text-primary hover:no-underline',
                  selected ? 'bg-primary/20' : ''
                )
              }
            >
              {item.header}
            </Tab>
          ))}
        </Tab.List>

        {/* Dashboard Content */}
        <Tab.Panels>
          {dashboardNav.map((item, itemIdx) => (
            <Tab.Panel as="main" key={`dashboard-panel-${itemIdx}`} className="px-4 py-4">
              {item.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </Layout>
  )
}
