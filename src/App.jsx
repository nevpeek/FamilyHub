import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:3001";

function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFamilyMembers() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/family`);

        if (!response.ok) {
          throw new Error("Failed to load family members");
        }

        const data = await response.json();

        setMembers(data.members || []);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to FamilyHub API");
      } finally {
        setLoading(false);
      }
    }

    loadFamilyMembers();
  }, []);

  return (
    <div className="familyhub-app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Family command centre</p>
          <h1>FamilyHub</h1>
        </div>

        <div className="status-pill">
          <span className="status-dot" />
          Online
        </div>
      </header>

      <main>
        <section className="welcome-card">
          <div>
            <p className="eyebrow">Welcome home</p>
            <h2>Your family, all in one place.</h2>
            <p className="welcome-copy">
              Calendar, tasks, meals, shopping and everything your family
              needs to stay organised.
            </p>
          </div>

          <button type="button" className="primary-button">
            + Add Event
          </button>
        </section>

        <section className="family-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Family</p>
              <h2>Who's here</h2>
            </div>

            <span>{members.length} members</span>
          </div>

          {loading && <p className="message">Loading family...</p>}

          {error && <p className="message error-message">{error}</p>}

          {!loading && !error && (
            <div className="member-grid">
              {members.map((member) => (
                <article className="member-card" key={member.id}>
                  <div
                    className="member-avatar"
                    style={{ backgroundColor: member.colour }}
                  >
                    {member.initials || member.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{member.name}</h3>
                    <p>Family member</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <p className="eyebrow">Today</p>
            <h2>No events yet</h2>
            <p>Your family calendar will appear here.</p>
          </article>

          <article className="dashboard-card">
            <p className="eyebrow">Tasks</p>
            <h2>All caught up</h2>
            <p>Chores and reminders will appear here.</p>
          </article>

          <article className="dashboard-card">
            <p className="eyebrow">Dinner</p>
            <h2>Nothing planned</h2>
            <p>Your meal planner will appear here.</p>
          </article>

          <article className="dashboard-card">
            <p className="eyebrow">Shopping</p>
            <h2>List is empty</h2>
            <p>Shared shopping items will appear here.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;