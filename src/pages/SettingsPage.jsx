import {
  Settings,
  Users,
} from "lucide-react";

function SettingsPage({
  members,
  onEditMember,
  onAddMember,
}) {
  return (
    <div className="settings-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">
            Settings
          </p>

          <h2>FamilyHub Settings</h2>

          <p>
            Manage your family and FamilyHub
            preferences.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <Users size={22} />
          </div>

          <div>
            <div className="settings-family-heading-row">
  <div>
    <h3>Family Members</h3>
    <p>
      Manage the people who use
      FamilyHub.
    </p>
  </div>

  <button
    type="button"
    className="settings-add-member-button"
    onClick={onAddMember}
  >
    + Add Member
  </button>
</div>
          </div>
        </div>

        <div className="settings-member-list">
          {members.map((member) => (
            <button
  type="button"
  key={member.id}
  className="settings-member-card"
  onClick={() =>
    onEditMember?.(member)
  }
>
              <div
                className="settings-member-avatar"
                style={{
                  backgroundColor:
                    member.colour,
                }}
              >
                {member.initials ||
                  member.name.charAt(0)}
              </div>

              <div className="settings-member-details">
                <strong>{member.name}</strong>
                <span>Family member</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section settings-placeholder-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <Settings size={22} />
          </div>

          <div>
            <h3>FamilyHub Preferences</h3>
            <p>
              More settings will be available
              here as FamilyHub grows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;