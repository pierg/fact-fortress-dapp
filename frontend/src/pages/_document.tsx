import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" style={{margin: 0, padding: 0, height: '100vh', width:'100vw'}}>
      <Head style={{margin: 0, padding: 0, height: '100vh', width:'100vw'}} />
      <body style={{margin: 0, paddingBottom: 0, height: '100vh', width:'100vw'}}>
        <Main  />
        <NextScript />
      </body>
    </Html>
  )
}
