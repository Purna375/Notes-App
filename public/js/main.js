// main.js - Modern note-taking app functionality
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const userNameEl = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const newNoteBtn = document.getElementById('new-note-btn');
  const tagsList = document.getElementById('tags-list');
  const notesGrid = document.getElementById('notes-grid');
  const noteDetail = document.getElementById('note-detail');
  const noteView = document.getElementById('note-view');
  const editNoteBtn = document.getElementById('edit-note-btn');
  const deleteNoteBtn = document.getElementById('delete-note-btn');
  const backBtn = document.getElementById('back-btn');
  const noteModal = document.getElementById('note-modal');
  const modalTitle = document.getElementById('modal-title');
  const closeModal = document.querySelector('.close');
  const noteForm = document.getElementById('note-form');
  const noteIdInput = document.getElementById('note-id');
  const noteTitleInput = document.getElementById('note-title');
  const noteContentInput = document.getElementById('note-content');
  const noteTagsInput = document.getElementById('note-tags');
  const flashMessage = document.getElementById('flash-message');
  const themeToggle = document.querySelector('.theme-toggle');
  const noteContentPreview = document.getElementById('note-content-preview');
  const loadingOverlay = document.getElementById('loading-overlay');

  // State
  let currentUser = null;
  let notes = [];
  let allTags = new Set();
  let activeTag = null;
  let currentNoteId = null;
  
  // Show/hide loading indicator
  const showLoading = () => {
      loadingOverlay.classList.remove('hidden');
  };
  
  const hideLoading = () => {
      loadingOverlay.classList.add('hidden');
  };
  
  // Check if user is already logged in
  const checkAuth = async () => {
      showLoading();
      try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (data.success) {
              currentUser = data.data;
              showApp();
              fetchNotes();
          } else {
              showAuth();
          }
      } catch (err) {
          console.error('Error checking authentication:', err);
          showFlashMessage('Unable to connect to server. Please try again later.', 'error');
          showAuth();
      } finally {
          hideLoading();
      }
  };
  
  // Auth tabs
  loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
  });
  
  registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
  });
  
  // Login form
  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      
      submitBtn.classList.add('loading-btn');
      submitBtn.disabled = true;
      
      try {
          const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (data.success) {
              currentUser = data.data;
              showFlashMessage('Logged in successfully!', 'success');
              loginForm.reset();
              showApp();
              fetchNotes();
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Login error:', err);
          showFlashMessage('An error occurred. Please try again.', 'error');
      } finally {
          submitBtn.classList.remove('loading-btn');
          submitBtn.disabled = false;
      }
  });
  
  // Register form
  registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      
      submitBtn.classList.add('loading-btn');
      submitBtn.disabled = true;
      
      try {
          const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name, email, password })
          });
          
          const data = await response.json();
          
          if (data.success) {
              currentUser = data.data;
              showFlashMessage('Account created successfully!', 'success');
              registerForm.reset();
              showApp();
              fetchNotes();
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Register error:', err);
          showFlashMessage('An error occurred. Please try again.', 'error');
      } finally {
          submitBtn.classList.remove('loading-btn');
          submitBtn.disabled = false;
      }
  });
  
  // Logout
  logoutBtn.addEventListener('click', async () => {
      showLoading();
      try {
          const response = await fetch('/api/auth/logout');
          const data = await response.json();
          
          if (data.success) {
              currentUser = null;
              notes = [];
              showAuth();
              showFlashMessage('Logged out successfully!', 'success');
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Logout error:', err);
          showFlashMessage('An error occurred. Please try again.', 'error');
      } finally {
          hideLoading();
      }
  });
  
  // Fetch all notes
  const fetchNotes = async () => {
      showLoading();
      try {
          let url = '/api/notes';
          
          if (activeTag) {
              url += `?tag=${encodeURIComponent(activeTag)}`;
          }
          
          if (searchInput.value.trim()) {
              const separator = url.includes('?') ? '&' : '?';
              url += `${separator}search=${encodeURIComponent(searchInput.value.trim())}`;
          }
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.success) {
              notes = data.data;
              renderNotes();
              collectTags();
              renderTags();
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Error fetching notes:', err);
          showFlashMessage('An error occurred while fetching notes.', 'error');
      } finally {
          hideLoading();
      }
  };
  
  // Collect all unique tags
  const collectTags = () => {
      allTags = new Set();
      
      notes.forEach(note => {
          note.tags.forEach(tag => {
              if (tag.trim()) {
                  allTags.add(tag.trim());
              }
          });
      });
  };
  
  // Render tags list
  const renderTags = () => {
      tagsList.innerHTML = '';
      
      // Add "All" tag
      const allTagLi = document.createElement('li');
      const allTagBtn = document.createElement('button');
      allTagBtn.textContent = 'All Notes';
      if (activeTag === null) {
        allTagBtn.classList.add('active-tag');
    }
      allTagBtn.addEventListener('click', () => {
          activeTag = null;
          fetchNotes();
      });
      allTagLi.appendChild(allTagBtn);
      tagsList.appendChild(allTagLi);
      
      // Add all other tags
      Array.from(allTags).sort().forEach(tag => {
          const li = document.createElement('li');
          const button = document.createElement('button');
          button.textContent = `#${tag}`;
          if (activeTag === tag) {
            button.classList.add('active-tag');
        }
          button.addEventListener('click', () => {
              activeTag = tag;
              fetchNotes();
          });
          li.appendChild(button);
          tagsList.appendChild(li);
      });

      // Apply staggered animations
      const tagItems = tagsList.querySelectorAll('li');
      tagItems.forEach((item, index) => {
          item.classList.add('stagger-item');
          setTimeout(() => {
              item.classList.add('visible');
          }, 50 * index);
      });
  };
  
  // Render notes grid
  const renderNotes = () => {
      notesGrid.innerHTML = '';
      
      if (notes.length === 0) {
          const emptyState = document.createElement('div');
          emptyState.classList.add('empty-state');
          emptyState.innerHTML = `
              <i class="fas fa-sticky-note"></i>
              <h3>No notes found</h3>
              <p>Create your first note to get started!</p>
              <button id="empty-new-note-btn" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Create Note
              </button>
          `;
          notesGrid.appendChild(emptyState);
          
          document.getElementById('empty-new-note-btn').addEventListener('click', () => {
              showNoteModal();
          });
          return;
      }
      
      notes.forEach((note, index) => {
          const noteCard = document.createElement('div');
          noteCard.classList.add('note-card', 'fade-in-up');
          noteCard.dataset.id = note._id;
          
          const title = document.createElement('h3');
          title.textContent = note.title;
          
          const content = document.createElement('div');
          // Show only first 100 characters of content
          content.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
          
          const date = document.createElement('div');
          date.classList.add('note-date');
          date.textContent = new Date(note.createdAt).toLocaleDateString();
          
          const tagsContainer = document.createElement('div');
          tagsContainer.classList.add('note-tags');
          
          note.tags.forEach(tag => {
              if (tag.trim()) {
                  const tagSpan = document.createElement('span');
                  tagSpan.classList.add('tag');
                  tagSpan.textContent = tag;
                  tagsContainer.appendChild(tagSpan);
              }
          });
          
          noteCard.appendChild(title);
          noteCard.appendChild(content);
          noteCard.appendChild(date);
          
          if (note.tags.length > 0) {
              noteCard.appendChild(tagsContainer);
          }
          
          noteCard.addEventListener('click', () => {
              showNoteDetail(note._id);
          });
          
          notesGrid.appendChild(noteCard);
          
          // Stagger animation
          setTimeout(() => {
              noteCard.classList.add('visible');
          }, 50 * index);
      });

      // Initialize intersection observer for animations
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  observer.unobserve(entry.target);
              }
          });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in-up').forEach(element => {
          observer.observe(element);
      });
  };
  
  // Show note detail
  const showNoteDetail = async (noteId) => {
      showLoading();
      try {
          const response = await fetch(`/api/notes/${noteId}`);
          const data = await response.json();
          
          if (data.success) {
              const note = data.data;
              currentNoteId = note._id;
              
              // Create note view with smooth animation
              noteView.innerHTML = `
                  <h1>${note.title}</h1>
                  <div class="note-content">${marked.parse(note.content)}</div>
                  <div class="note-meta">
                      <div class="note-date">Created: ${new Date(note.createdAt).toLocaleString()}</div>
                      <div class="note-tags">
                          ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                      </div>
                  </div>
              `;
              
              // Show note detail
              noteDetail.classList.remove('hidden');
              noteDetail.classList.add('page-transition');

              // Apply syntax highlighting if any code blocks
              if (document.querySelectorAll('pre code').length > 0 && window.hljs) {
                  document.querySelectorAll('pre code').forEach(block => {
                      hljs.highlightBlock(block);
                  });
              }
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Error fetching note:', err);
          showFlashMessage('An error occurred while fetching the note.', 'error');
      } finally {
          hideLoading();
      }
  };
  
  // Back button
  backBtn.addEventListener('click', () => {
      noteDetail.classList.add('hidden');
      currentNoteId = null;
  });
  
  // Show note modal for editing or creating
  const showNoteModal = (noteId = null) => {
      // Clear form
      noteForm.reset();
      noteIdInput.value = '';
      noteContentPreview.innerHTML = '';
      
      if (noteId) {
          const note = notes.find(n => n._id === noteId);
          
          if (note) {
              // Populate form
              noteIdInput.value = note._id;
              noteTitleInput.value = note.title;
              noteContentInput.value = note.content;
              noteTagsInput.value = note.tags.join(', ');
              
              // Update modal title
              modalTitle.textContent = 'Edit Note';
              
              // Show preview
              noteContentPreview.innerHTML = marked.parse(note.content);
          }
      } else {
          // Update modal title
          modalTitle.textContent = 'Add New Note';
      }
      
      // Show modal
      noteModal.classList.remove('hidden');
  };
  
  // Edit note
  editNoteBtn.addEventListener('click', () => {
      if (!currentNoteId) return;
      showNoteModal(currentNoteId);
  });
  
  // Delete note
  deleteNoteBtn.addEventListener('click', async () => {
      if (!currentNoteId) return;
      
      if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
          showLoading();
          try {
              const response = await fetch(`/api/notes/${currentNoteId}`, {
                  method: 'DELETE'
              });
              
              const data = await response.json();
              
              if (data.success) {
                  showFlashMessage('Note deleted successfully!', 'success');
                  noteDetail.classList.add('hidden');
                  currentNoteId = null;
                  fetchNotes();
              } else {
                  showFlashMessage(data.message, 'error');
              }
          } catch (err) {
              console.error('Error deleting note:', err);
              showFlashMessage('An error occurred while deleting the note.', 'error');
          } finally {
              hideLoading();
          }
      }
  });
  
  // New note button
  newNoteBtn.addEventListener('click', () => {
      showNoteModal();
  });
  
  // Close modal
  closeModal.addEventListener('click', () => {
      noteModal.classList.add('hidden');
  });
  
  // Click outside modal to close
  noteModal.addEventListener('click', (e) => {
      if (e.target === noteModal) {
          noteModal.classList.add('hidden');
      }
  });
  
  // Preview markdown while typing
  noteContentInput.addEventListener('input', () => {
      noteContentPreview.innerHTML = marked.parse(noteContentInput.value);
  });
  
  // Note form submission
  noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const noteId = noteIdInput.value;
      const title = noteTitleInput.value;
      const content = noteContentInput.value;
      const tags = noteTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const noteData = {
          title,
          content,
          tags
      };
      
      const submitBtn = noteForm.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading-btn');
      submitBtn.disabled = true;
      
      try {
          let response;
          
          if (noteId) {
              // Update existing note
              response = await fetch(`/api/notes/${noteId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(noteData)
              });
          } else {
              // Create new note
              response = await fetch('/api/notes', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(noteData)
              });
          }
          
          const data = await response.json();
          
          if (data.success) {
              showFlashMessage(noteId ? 'Note updated successfully!' : 'Note created successfully!', 'success');
              noteModal.classList.add('hidden');
              noteForm.reset();
              
              // If we're editing a note that's currently displayed
              if (noteId && noteId === currentNoteId) {
                  showNoteDetail(noteId);
              }
              
              fetchNotes();
          } else {
              showFlashMessage(data.message, 'error');
          }
      } catch (err) {
          console.error('Error saving note:', err);
          showFlashMessage('An error occurred while saving the note.', 'error');
      } finally {
          submitBtn.classList.remove('loading-btn');
          submitBtn.disabled = false;
      }
  });
  
  // Search notes
  searchBtn.addEventListener('click', () => {
      fetchNotes();
  });
  
  // Search on enter key
  searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
          fetchNotes();
      }
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      
      // Save theme preference
      if (document.body.classList.contains('dark-mode')) {
          localStorage.setItem('theme', 'dark');
          themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
          localStorage.setItem('theme', 'light');
          themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
  });
  
  // Load theme preference
  const loadTheme = () => {
      const theme = localStorage.getItem('theme');
      
      if (theme === 'dark') {
          document.body.classList.add('dark-mode');
          themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
          themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
  };
  
  // Show flash message
  const showFlashMessage = (message, type) => {
      flashMessage.textContent = message;
      flashMessage.className = 'flash-message';
      flashMessage.classList.add(`flash-${type}`);
      flashMessage.style.display = 'block';
      
      setTimeout(() => {
          flashMessage.style.display = 'none';
      }, 5000);
  };
  
  // Show auth container
  const showAuth = () => {
      authContainer.classList.remove('hidden');
      appContainer.classList.add('hidden');
      authContainer.classList.add('page-transition');
  };
  
  // Show app container
  const showApp = () => {
      authContainer.classList.add('hidden');
      appContainer.classList.remove('hidden');
      appContainer.classList.add('page-transition');
      
      // Update user name
      userNameEl.textContent = currentUser.name;
  };
  
  // Handle scroll animations
  const initScrollAnimations = () => {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  observer.unobserve(entry.target);
              }
          });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in-up').forEach(element => {
          observer.observe(element);
      });
  };
  
  // Initialize app
  const init = () => {
      loadTheme();
      checkAuth();
      initScrollAnimations();
  };
  
  init();
});