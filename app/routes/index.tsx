import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Deta } from "deta";

const deta = Deta("Your Deta Key");

const db = deta.Base("deta-remix");

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  switch (data.get("_action")) {
    case "create":
      const name = data.get("name");
      const message = data.get("message");
      return name && message
        ? await db.put({ name: name as string, message: message as string })
        : {
            error: "name and message are required",
          };
    case "delete":
      const key = data.get("key");
      return key
        ? await db.delete(key as string)
        : { error: "key is required" };
      default:
        return { error: "unknown action" };
  }
};

export const loader: LoaderFunction = async () => {
  return await db.fetch();
};

export default function Index() {
  let res = useLoaderData();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <p>Fun fact: this app can also function without JavaScript</p>
      <div>
        {res.items.map((d: {
          key: string;
          name: string;
          message: string;
        }) => {
          return (
            <div
              key={d.key}
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <b style={{ textDecoration: "italic" }}>
                {d.name} - {d.message}
              </b>
              <Form method="delete">
                <input type="hidden" name="key" value={d.key} />
                <button name="_action" value="delete" type="submit">
                  Delete
                </button>
              </Form>
            </div>
          );
        })}
      </div>
      <Form method="post" style={{ padding: "1rem 0" }}>
        <p>
          <label htmlFor="name">
            Name
          </label>
          <br />
            <input type="text" name="name" />
        </p>
        <p>
          <label htmlFor="message">
            Message
          </label>
          <br />
            <input type="text" name="message" />
        </p>
        <p>
          <button name="_action" value="create">Add</button>
        </p>
      </Form>
    </div>
  );
}
