import React, { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import { grey } from '@mui/material/colors'
import { ProgressSceleton } from '@tac/ui'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    grey: {
      main: grey[200],
      light: grey[200],
      dark: grey[400],
      contrastText: grey[900],
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
  },
})

export default function HelloWorld() {
  const [tableName, setTableName] = useState('')
  const [data, setData] = useState(null)
  const [formIssue, setFormIssue] = useState(null)

  const getIssues = async () => {
    const jwt = await AP.context.getToken().then((token) => {
      return token
    })

    return await fetch(`/issues`, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${jwt}`,
        Accept: 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        setData(res)
        console.log(res)
      })
      .catch((err) => console.error(err))
  }

  const handleDeleteIssue = async (id) => {
    const jwt = await AP.context.getToken().then((token) => {
      return token
    })

    return await fetch(`/issue/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `JWT ${jwt}`,
        Accept: 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) {
          const arrFilter = data.filter((el) => el.id !== id)
          setData(arrFilter)
          setIssueId('')
        } else {
          return res.json()
        }
      })
      .catch((err) => console.error(err))
  }

  const handleUpdateIssue = async ({ event, id, data }) => {
    event.preventDefault()
    const jwt = await AP.context.getToken().then((token) => {
      return token
    })

    const bodyData = JSON.stringify(data)

    return await fetch(`/issue/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `JWT ${jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    })
      .then((res) => {
        return res.json()
      })
      .catch((err) => console.error(err))
  }

  const handleUpdateTableName = async (e) => {
    console.log('table name', e.currentTarget)
    e.preventDefault()
    const data = { text: tableName }
    const jwt = await AP.context.getToken().then((token) => {
      return token
    })

    const bodyData = JSON.stringify(data)

    return await fetch(`/tables`, {
      method: 'PUT',
      headers: {
        Authorization: `JWT ${jwt}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: bodyData,
    })
      .then((res) => {
        return res.json()
      })
      .catch((err) => console.error(err))
  }

  const getTableName = async () => {
    const jwt = await AP.context.getToken().then((token) => {
      return token
    })
    return await fetch(`/tables`, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${jwt}`,
        Accept: 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        setTableName('text' in res ? res.text : '')
      })
      .catch((err) => {
        setTableName('')
        console.error(err)
      })
  }

  const onChange = (event) => {
    setFormIssue({ [event.target.name]: event.target.value })
  }

  useEffect(() => {
    getIssues()
    getTableName()
  }, [])

  if (!data) {
    return <ProgressSceleton />
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ padding: '25px 35px' }}>
          <form onSubmit={handleUpdateTableName} autoComplete="off">
            <TextField
              name="table"
              variant="standard"
              onChange={(e) => setTableName(e.target.value)}
              value={tableName}
            />
          </form>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Summary</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delete button</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.key}
                  </TableCell>
                  <TableCell>
                    <form
                      onSubmit={(event) => {
                        const data = {
                          [event.currentTarget.elements.summary.name]:
                            event.currentTarget.elements.summary.value,
                        }
                        handleUpdateIssue({ event, id: row.id, data })
                      }}
                      autoComplete="off"
                    >
                      <TextField
                        id="summary"
                        size="small"
                        variant="standard"
                        name="summary"
                        defaultValue={row.summary}
                      />
                    </form>
                  </TableCell>
                  <TableCell>
                    <form
                      onSubmit={(event) => {
                        const data = {
                          [event.currentTarget.elements.description.name]:
                            event.currentTarget.elements.description.value,
                        }
                        handleUpdateIssue({ event, id: row.id, data })
                      }}
                      autoComplete="off"
                    >
                      <TextField
                        id="description"
                        size="small"
                        variant="standard"
                        name="description"
                        defaultValue={row.description}
                      />
                    </form>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={row.avatar} sx={{ marginRight: '10px' }} />
                      {row.assignee}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      color="grey"
                      variant="contained"
                      onClick={() => handleDeleteIssue(row.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </ThemeProvider>
    )
  }
}
