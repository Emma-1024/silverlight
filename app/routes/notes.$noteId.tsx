import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteNote, getNote } from "~/models/note.server";
import { requireUserId } from "~/auth.server";
import { hasPermission } from "~/utils";
import { permissionConsts } from "~/constants/permissionConsts";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");
  invariant(typeof userId === "string", "User must login");
  const note = await getNote({ id: params.noteId, userId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  // Check user's permission
  const isDeleteNotesPermissionValid = await hasPermission(
    userId,
    permissionConsts.DELETE_NOTES,
  );

  return json({ note, isDeleteNotesPermissionValid });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");
  invariant(typeof userId === "string", "User must login");
  const isDeleteNotesPermissionValid = await hasPermission(
    userId,
    permissionConsts.DELETE_NOTES,
  );
  if (!isDeleteNotesPermissionValid) {
    return json(
      {
        errors: {
          message:
            "Forbidden! Not have permission to access the requested resource.",
        },
      },
      { status: 403 },
    );
  }
  await deleteNote({ id: params.noteId, userId });
  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 data-testid="note-detail-title" className="text-2xl font-bold">
        {data.note.title}
      </h3>
      <p data-testid="note-detail-body" className="py-6">
        {data.note.body}
      </p>
      <hr className="my-4" />
      {data.isDeleteNotesPermissionValid ? (
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
