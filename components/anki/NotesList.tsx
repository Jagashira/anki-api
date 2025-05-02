// components/anki/NotesList.tsx
import React from "react";

interface Note {
  noteId: string;
  fields: {
    Front: { value: string };
    Back: { value: string };
  };
  tags?: string[];
}

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const NotesList: React.FC<NotesListProps> = ({ notes, loading, error }) => {
  if (loading)
    return (
      <div className="ext-lg font-bold mb-2 text-center">
        <p>ノート読み込み中...</p>
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  if (notes.length === 0) return null;

  return (
    <div className="max-w-4xl p-6  mx-auto">
      <h2 className="text-lg font-bold mb-2 text-center">取得したノート一覧</h2>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {notes.map((note) => (
          <div
            key={note.noteId}
            className="min-w-[300px] p-4 border rounded bg-white shadow break-words overflow-hidden"
          >
            <div className="mb-2">
              <strong className="text-blue-700">Front:</strong>{" "}
              {note.fields.Front.value}
            </div>

            <div className="mb-2">
              <strong className="text-blue-700">Back:</strong>
              <div
                className="mt-1 text-gray-700 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: note.fields.Back.value,
                }}
              />
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                <strong>Tags:</strong> {note.tags.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
