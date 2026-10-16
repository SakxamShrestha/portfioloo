# Logging a reading-list entry from your phone

The `/reading` page is built from `src/app/data/readingList.json`, which is a plain
static file committed to the repo. To add an entry from a phone, you send a single
`repository_dispatch` event to GitHub. A workflow then appends the entry, validates
the JSON, commits it, and redeploys the site.

Nothing on the phone edits JSON directly — the phone sends a URL, and
`scripts/addReading.mjs` does the file surgery on a runner. A malformed request
fails the workflow instead of breaking the site build.

End-to-end latency is roughly two minutes.

## 1. Create the token

Create a **fine-grained** personal access token at
<https://github.com/settings/personal-access-tokens/new>.

| Setting | Value |
| --- | --- |
| Repository access | Only select repositories → `SakxamShrestha/portfioloo` |
| Permissions → Contents | Read and write |
| Expiration | Your call — see the note below |

`Contents: read and write` is what the "create a repository dispatch event"
endpoint requires. Do not grant anything else, and do not use a classic token:
classic tokens with the `repo` scope can write to every repository on the account,
and this token is going to live on a phone.

If you set an expiration, put a calendar reminder a few days before it. An expired
token makes the Shortcut fail quietly, and a reading list that silently stopped
updating six months ago is worse than not having one.

## 2. Verify the plumbing before building anything

Run this from a laptop first. If this does not work, the Shortcut will not either,
and debugging a `curl` is much easier than debugging a Shortcut.

```bash
curl -i -X POST https://api.github.com/repos/SakxamShrestha/portfioloo/dispatches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{
        "event_type": "add-reading",
        "client_payload": { "url": "https://example.com/some-post" }
      }'
```

A successful call returns `204 No Content` with an empty body. Watch the run at
<https://github.com/SakxamShrestha/portfioloo/actions>, then check `/reading`.

## 3. Build the iOS Shortcut

Create a new shortcut named something like **Log Reading**.

In the shortcut settings, enable **Show in Share Sheet** and restrict the accepted
input types to **URLs** and **Safari web pages**. That is what puts it in the share
menu when you are reading something.

Actions, in order:

1. **Receive** *URLs* and *Safari web pages* from the share sheet.
2. **Text** — set the contents to the JSON body below. Insert the shortcut input as
   a magic variable where `SHORTCUT_INPUT` appears, so the real URL is substituted:

   ```json
   {"event_type":"add-reading","client_payload":{"url":"SHORTCUT_INPUT"}}
   ```

3. **Get Contents of URL** — configured as:
   - URL: `https://api.github.com/repos/SakxamShrestha/portfioloo/dispatches`
   - Method: `POST`
   - Headers:
     - `Authorization`: `Bearer YOUR_TOKEN`
     - `Accept`: `application/vnd.github+json`
   - Request Body: **File**, with the Text action's output as the body.

   Use the *File* body type rather than *JSON*. The JSON body builder in Shortcuts
   will try to re-encode the nested object and tends to mangle it.

4. **Show Notification** — something like "Logged to reading list". This step is not
   optional in practice. Without it the share sheet gives no feedback, so a failing
   token or a typo'd URL looks exactly like success, and you will not notice for
   weeks.

### Android

Same HTTP request, different wrapper. [HTTP Shortcuts](https://http-shortcuts.rmy.ch/)
registers in the Android share menu and can POST a static body with `$ {shared_text}`
substitution. Tasker works too if you already use it.

## 4. Optional fields

`url` is the only required field. The workflow derives the title from the page's
`<title>` tag and the source from the hostname, and stamps the date as the day the
event was processed. Any of these can be supplied explicitly:

```json
{
  "event_type": "add-reading",
  "client_payload": {
    "url": "https://example.com/some-post",
    "title": "An explicit title",
    "author": "Jane Smith",
    "note": "One line on why this was worth reading.",
    "tags": "distributed-systems, storage"
  }
}
```

`tags` accepts either a comma-separated string or an array. A second Shortcut with
an **Ask for Input** action feeding `note` is a reasonable addition once the basic
flow is working — but get the one-tap version working first.

Submitting a URL that is already in the list is a no-op: the workflow logs it, skips
the commit, and does not redeploy.

## 5. Editing or removing entries

Edit `src/app/data/readingList.json` directly and push. The workflow is only a
convenience for appending; the file is the source of truth and nothing else writes
to it.
