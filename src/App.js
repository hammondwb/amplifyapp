import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { ListNotess } from './graphql/queries';
import { createNotes as createNoteMutation, deleteNotes as deleteNoteMutation } from './graphql/mutations';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Input, Button } from '@material-ui/core';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: ListNotess});
    setNotes(apiData.data.listNotess.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: {input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <div>
        <h1>My Notes App</h1>
        <Input
          onChange={e => setFormData({ ...formData, 'name': e.target.value})}
          placeholder="Note name"
          value={formData.name}
        />
        <Input
          onChange={e => setFormData({ ...formData, 'description': e.target.value})}
          placeholder="Note description"
          value={formData.description}
        />
        <Button onClick={createNote}>Create Note</Button>
      </div>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <Button onClick={() => deleteNote(note)}>Delete Note</Button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />

    </div>
  )
}

export default withAuthenticator(App);
