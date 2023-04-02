import React from 'react'
import Image from 'next/image'

type Props = {}

export default function Logo({}: Props) {
  return <Image src="/logo.svg" alt="CMF MES" width={256} height={256} className="h-8 w-8" />
}
