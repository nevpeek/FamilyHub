import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  ListChecks,
  Settings2,
} from "lucide-react";

import ListItemModal from "../components/ListItemModal";
import ListModal from "../components/ListModal";

const API_BASE_URL =
  "http://localhost:3001";

function ListsPage({
  members = [],
}) {
  const [lists, setLists] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedListId, setSelectedListId] =
    useState(null);

  const [selectedList, setSelectedList] =
    useState(null);

  const [newListName, setNewListName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [newItemTitle, setNewItemTitle] =
    useState("");

  const [addingItem, setAddingItem] =
    useState(false);

  const [newItemMemberIds, setNewItemMemberIds] =
    useState([]);

  const [editingItem, setEditingItem] =
    useState(null);

  const [editingList, setEditingList] =
    useState(false);

  const [creatingList, setCreatingList] =
    useState(false);

  async function loadLists() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load lists"
        );
      }

      const nextLists =
        data.lists || [];

      setLists(nextLists);

      setSelectedListId(
        (current) => {
          if (
            current &&
            nextLists.some(
              (list) =>
                list.id === current
            )
          ) {
            return current;
          }

          return (
            nextLists[0]?.id ||
            null
          );
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load lists"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectedList(
    listId
  ) {
    if (!listId) {
      setSelectedList(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/${listId}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load list"
        );
      }

      setSelectedList(
        data.list
      );
    } catch (err) {
      console.error(err);

      setSelectedList(null);
    }
  }

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    loadSelectedList(
      selectedListId
    );
  }, [selectedListId]);

  async function createList(
    event
  ) {
    event.preventDefault();

    const name =
      newListName.trim();

    if (!name) {
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            icon: "📋",
            colour: "#22c55e",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create list"
        );
      }

      setNewListName("");

      await loadLists();

      setSelectedListId(
        data.list.id
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create list"
      );
    } finally {
      setCreating(false);
    }
  }

  async function addItem(event) {
    event.preventDefault();

    const title =
      newItemTitle.trim();

    if (!title || !selectedListId) {
      return;
    }

    setAddingItem(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/${selectedListId}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            memberIds:
              newItemMemberIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to add item"
        );
      }

      setNewItemTitle("");
      setNewItemMemberIds([]);
      setSelectedList(data.list);

      await loadLists();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to add item"
      );
    } finally {
      setAddingItem(false);
    }
  }

  async function toggleItem(item) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/items/${item.id}/completion`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            completed:
              !Boolean(
                item.is_completed
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update item"
        );
      }

      setSelectedList(data.list);

      await loadLists();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update item"
      );
    }
  }

  return (
    <section className="lists-page">
      <div className="calendar-page-heading">
        <div>
          <p className="page-kicker">
            FAMILY LISTS
          </p>

          <h2>
            Lists
          </h2>

          <p>
            Keep household lists together
            in one place.
          </p>
        </div>

        <div className="page-title-icon">
          <ListChecks size={24} />
        </div>
      </div>

      <div className="lists-workspace">
        <aside className="lists-sidebar">
          <div className="lists-sidebar-heading">
            <div>
              <span>
                YOUR LISTS
              </span>

              <strong>
                {lists.length}{" "}
                {lists.length === 1
                  ? "list"
                  : "lists"}
              </strong>
            </div>
          </div>

          <form
            className="lists-create-form"
            onSubmit={createList}
          >
            <input
              type="text"
              value={newListName}
              onChange={(event) =>
                setNewListName(
                  event.target.value
                )
              }
              placeholder="New list name"
            />

<button
  type="button"
  onClick={() => setCreatingList(true)}
  aria-label="Create list"
>
  <Plus size={18} />
</button>
          </form>

          {loading ? (
            <div className="lists-sidebar-empty">
              Loading lists...
            </div>
          ) : error ? (
            <div className="lists-sidebar-empty">
              {error}
            </div>
          ) : lists.length === 0 ? (
            <div className="lists-sidebar-empty">
              Create your first family
              list.
            </div>
          ) : (
            <div className="lists-sidebar-items">
              {lists.map((list) => (

<button
  key={list.id}
  type="button"
  className={`lists-sidebar-item ${
    selectedListId ===
    list.id
      ? "active"
      : ""
  }`}
  style={{
    "--list-colour":
      list.colour || "#22c55e",
  }}
  onClick={() =>
    setSelectedListId(
      list.id
    )
  }
>
                  <span className="lists-sidebar-icon">
                    {list.icon ||
                      "📋"}
                  </span>

                  <span className="lists-sidebar-copy">
                    <strong>
                      {list.name}
                    </strong>

                    <small>
                      {list.open_count} open
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="lists-board">
          {!selectedList ? (
            <div className="lists-empty-board">
              <div>
                <ListChecks
                  size={36}
                />

                <h3>
                  No list selected
                </h3>

                <p>
                  Create or choose a list
                  to get started.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="lists-board-heading">
                <div>
                  <span>
                    {selectedList.icon ||
                      "📋"}
                  </span>

                  <div>
                    <h3>
                      {selectedList.name}
                    </h3>

                    <p>
                      {
                        selectedList.items
                          ?.filter(
                            (item) =>
                              !item.is_completed
                          ).length || 0
                      }{" "}
                      items remaining
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="lists-edit-button"
                  onClick={() =>
                    setEditingList(true)
                  }
                >
                  <Settings2 size={17} />
                  Edit List
                </button>
              </div>

              <div className="family-list-content">
                <div className="family-list-add-area">
                  <form
                    className="family-list-quick-add"
                    onSubmit={addItem}
                  >
                    <Plus size={20} />

                    <input
                      type="text"
                      value={newItemTitle}
                      onChange={(event) =>
                        setNewItemTitle(
                          event.target.value
                        )
                      }
                      placeholder={`Add to ${selectedList.name}`}
                    />

                    <button
                      type="submit"
                      disabled={
                        addingItem ||
                        !newItemTitle.trim()
                      }
                    >
                      {addingItem
                        ? "Adding..."
                        : "Add"}
                    </button>
                  </form>

                  <div className="family-list-add-members">
                    <span>
                      Who is this for?
                    </span>

                    <div>
                      {members.map((member) => {
                        const memberId =
                          Number(member.id);

                        const selected =
                          newItemMemberIds.includes(
                            memberId
                          );

                        return (
                          <button
                            key={member.id}
                            type="button"
                            className={`family-list-add-member ${
                              selected
                                ? "selected"
                                : ""
                            }`}
                            style={{
                              "--member-colour":
                                member.colour ||
                                "#22c55e",
                            }}
                            onClick={() =>
                              setNewItemMemberIds(
                                (current) =>
                                  current.includes(
                                    memberId
                                  )
                                    ? current.filter(
                                        (id) =>
                                          id !==
                                          memberId
                                      )
                                    : [
                                        ...current,
                                        memberId,
                                      ]
                              )
                            }
                          >
                            <span>
                              {member.photo_url ? (
                                <img
                                  src={
                                    member.photo_url.startsWith(
                                      "http"
                                    )
                                      ? member.photo_url
                                      : `${API_BASE_URL}${member.photo_url}`
                                  }
                                  alt={
                                    member.name
                                  }
                                />
                              ) : (
                                member.initials ||
                                member.name
                                  ?.slice(0, 1)
                                  .toUpperCase()
                              )}
                            </span>

                            {member.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {!selectedList.items?.length ? (
                  <div className="lists-empty-board">
                    <div>
                      <ListChecks size={34} />

                      <h3>
                        This list is empty
                      </h3>

                      <p>
                        Add your first item above.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="family-list-items">
                    {selectedList.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className={`family-list-item ${
                            item.is_completed
                              ? "completed"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="family-list-checkbox"
                            onClick={() =>
                              toggleItem(item)
                            }
                            aria-label={
                              item.is_completed
                                ? `Mark ${item.title} incomplete`
                                : `Mark ${item.title} complete`
                            }
                          >
                            {item.is_completed
                              ? "✓"
                              : ""}
                          </button>

                          <button
                            type="button"
                            className="family-list-item-details"
                            onClick={() =>
                              setEditingItem(
                                item
                              )
                            }
                          >
                            <span className="family-list-item-copy">
                              <strong>
                                {item.title}
                              </strong>

                              {item.notes && (
                                <small>
                                  {item.notes}
                                </small>
                              )}
                            </span>

                            {!!item.members?.length && (
                              <span className="family-list-item-members">
                                {item.members.map(
                                  (member) => (
                                    <span
                                      key={
                                        member.id
                                      }
                                      className="family-list-item-avatar"
                                      title={
                                        member.name
                                      }
                                      style={{
                                        "--member-colour":
                                          member.colour ||
                                          "#22c55e",
                                      }}
                                    >
                                      {member.photo_url ? (
<img
  src={
    member.photo_url.startsWith("http")
      ? member.photo_url
      : `${API_BASE_URL}${member.photo_url}`
  }
  alt={member.name}
/>
                                      ) : (
                                        member.initials ||
                                        member.name
                                          ?.slice(
                                            0,
                                            1
                                          )
                                          .toUpperCase()
                                      )}
                                    </span>
                                  )
                                )}
                              </span>
                            )}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

            {creatingList && (
        <ListModal
          mode="create"
          initialName={newListName}
          onClose={() => {
            setCreatingList(false);
          }}
          onSaved={async (createdList) => {
            setCreatingList(false);
            setNewListName("");

            await loadLists();

            setSelectedListId(
              createdList.id
            );
          }}
        />
      )}

      {editingList && selectedList && (
        <ListModal
          list={selectedList}
          onClose={() =>
            setEditingList(false)
          }
          onSaved={async (updatedList) => {
            setSelectedList(
              updatedList
            );

            setEditingList(false);

            await loadLists();
          }}
          onDeleted={async (deletedId) => {
            setEditingList(false);

            setSelectedList(null);

            setSelectedListId(null);

            const response = await fetch(
              `${API_BASE_URL}/api/lists`
            );

            const data =
              await response.json();

            const nextLists =
              data.lists || [];

            setLists(nextLists);

            if (nextLists.length > 0) {
              setSelectedListId(
                nextLists[0].id
              );
            }
          }}
        />
      )}

      {editingItem && (
        <ListItemModal
          item={editingItem}
          members={members}
          onClose={() =>
            setEditingItem(null)
          }
          onSaved={async (updatedList) => {
            if (updatedList) {
              setSelectedList(
                updatedList
              );
            } else {
              await loadSelectedList(
                selectedListId
              );
            }

            await loadLists();
          }}
        />
      )}
    </section>
  );
}

export default ListsPage;