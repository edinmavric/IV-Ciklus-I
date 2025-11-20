import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const explainConcepts = [
  {
    title: 'Kontrolisani inputi',
    detail:
      'Držimo value u state-u (`useState`) i prosleđujemo ga `<input value={...} onChange={...} />`, čime React uvek zna aktuelnu vrednost i može da validira podatke.',
  },
  {
    title: 'POST i DELETE zahtevi',
    detail:
      'Koristimo `axios.post(url, body)` za slanje novih podataka i `axios.delete(`${url}/${id}`)` za uklanjanje. Promise nam vraća odgovor sa servera.',
  },
  {
    title: 'Optimisticni UI update',
    detail:
      'Umesto ponovnog fetch-a, lokalno ažuriramo state (`setPosts([...posts, res.data])` ili filtriramo). Tako UI reaguje odmah (optimistični update).',
  },
];

const theoryConcepts = [
  {
    title: 'Loading i error stanja',
    detail:
      'Svaki zahtev može potrajati ili pasti. Prikazom `loading` (npr. spinner) i `error` poruke korisniku dajemo kontekst i sprečavamo prazne ekrane.',
  },
  {
    title: 'Conditional rendering',
    detail:
      'Jednostavno koristimo izraze poput `{loading && <Spinner />}` ili `error ? <ErrorCard /> : <PostList />` kako bismo kontrolisali šta se prikazuje.',
  },
  {
    title: 'Mapiranje i key prop',
    detail:
      'Za liste koristimo `array.map(item => <Card key={item.id} />)` da bi React znao koji element da osveži bez renderovanja cele liste.',
  },
];

const Spinner = () => (
  <div className="spinner" role="status" aria-live="polite">
    <span className="spinner__dot" />
    <p>Učitavanje podataka...</p>
  </div>
);

function App() {
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const isInitialLoad = loading && posts.length === 0;

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    axios
      .get(API_URL)
      .then(res => setPosts(res.data))
      .catch(() => setError('Greška pri učitavanju postova. Pokušajte ponovo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNewTitle('');
    setNewBody('');
  };

  const handleSubmit = event => {
    event.preventDefault();

    if (!newTitle.trim() || !newBody.trim()) {
      setFormError('Naslov i sadržaj su obavezni.');
      return;
    }

    setFormError('');
    setStatusMessage('');
    setSubmitting(true);

    const payload = {
      title: newTitle.trim(),
      body: newBody.trim(),
      userId: 1,
    };

    const request = editingId
      ? axios.patch(`${API_URL}/${editingId}`, { ...payload, id: editingId })
      : axios.post(API_URL, payload);

    request
      .then(res => {
        if (editingId) {
          setPosts(prev =>
            prev.map(post => (post.id === editingId ? res.data : post))
          );
          setStatusMessage('Post je uspešno izmenjen (optimistični update).');
        } else {
          setPosts(prev => [...prev, res.data]);
          setStatusMessage('Post je dodat (optimistični update).');
        }

        resetForm();
      })
      .catch(() => setError('Čuvanje posta nije uspelo.'))
      .finally(() => setSubmitting(false));
  };

  const handleDeletePost = id => {
    setStatusMessage('');
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => {
        setPosts(prev => prev.filter(post => post.id !== id));
      })
      .catch(() => setError('Brisanje posta nije uspelo.'));
  };

  const handleEditPost = post => {
    setEditingId(post.id);
    setNewTitle(post.title);
    setNewBody(post.body);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  if (isInitialLoad) {
    return (
      <main className="app app--centered">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">JSONPlaceholder demo</p>
          <h1>Postovi</h1>
          <p className="subtitle">
            Demonstracija kontrolisanih inputa, REST zahteva i optimističnih UI
            update-a.
          </p>
        </div>

        <div className="header__actions">
          <button
            className="btn btn--ghost"
            onClick={fetchPosts}
            disabled={loading}
          >
            {loading ? 'Učitavanje...' : 'Učitaj ponovo'}
          </button>
        </div>
      </header>

      <section className="info-panel">
        <h2>Objasni</h2>
        <div className="info-grid">
          {explainConcepts.map(concept => (
            <article key={concept.title} className="info-card">
              <h3>{concept.title}</h3>
              <p>{concept.detail}</p>
            </article>
          ))}
        </div>

        <h2>Teorija</h2>
        <div className="info-grid">
          {theoryConcepts.map(concept => (
            <article key={concept.title} className="info-card">
              <h3>{concept.title}</h3>
              <p>{concept.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="form-section">
        <div className="form-card">
          <h2>{editingId ? 'Izmeni post' : 'Dodaj novi post'}</h2>
          <p className="subtitle">
            Forma koristi kontrolisane inpute i validaciju pre slanja POST/PUT
            zahteva.
          </p>

          <form onSubmit={handleSubmit} className="post-form">
            <label htmlFor="title">Naslov</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Unesite naslov"
              value={newTitle}
              onChange={event => setNewTitle(event.target.value)}
            />

            <label htmlFor="body">Sadržaj</label>
            <textarea
              id="body"
              name="body"
              rows={4}
              placeholder="Unesite tekst..."
              value={newBody}
              onChange={event => setNewBody(event.target.value)}
            />

            {formError && <p className="form-error">{formError}</p>}
            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting}
              >
                {submitting
                  ? 'Slanje...'
                  : editingId
                  ? 'Sačuvaj izmene'
                  : 'Dodaj post'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCancelEdit}
                >
                  Otkaži
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button className="btn btn--danger" onClick={fetchPosts}>
            Pokušaj ponovo
          </button>
        </div>
      )}

      {loading && !isInitialLoad && (
        <div className="inline-spinner">
          <Spinner />
        </div>
      )}

      <section className="posts-section">
        <div className="posts-header">
          <h2>Lista postova</h2>
          <p>
            {posts.length} elemenata (renderovani preko `posts.map` sa `key`
            prop-om).
          </p>
        </div>

        <div className="post-grid">
          {posts.map(post => (
            <article className="post-card" key={post.id}>
              <div className="post-card__content">
                <p className="post-card__id">#{post.id}</p>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
              </div>

              <div className="post-card__actions">
                <button
                  className="btn btn--secondary btn--small"
                  onClick={() => handleEditPost(post)}
                >
                  Izmeni
                </button>
                <button
                  className="btn btn--danger btn--small"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Obriši
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
