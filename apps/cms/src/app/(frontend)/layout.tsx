import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Payload CMS foundation for Parallel Market AI.',
  title: 'Parallel Market AI CMS',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
