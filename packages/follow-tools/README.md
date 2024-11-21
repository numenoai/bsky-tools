# Bluesky Follow Tools by numeno.ai

This package includes a CLI that can be used to export your Bluesky followers to a JSON or CSV file.

We strongly suggest using a [Bluesky app password](#creating-a-bluesky-app-password) with this utility!

You will need to install `node` to run this tool. Here are [the instructions](https://nodejs.org/en/download/package-manager).

Now you can export your followers to CSV:

```sh
npx @numenoai/follow-tools followers --user=<username> --password=<password> --output=followers.csv --format=csv
```

For more options check out `npx @numenoai/follow-tools --help`.

Brought to you by the nice folks at [numeno.ai](https://numeno.ai).

## Creating a Bluesky app password

An App Password is a password you can create in Bluesky and which allows an external app to sign into your account. The advantage of using an app password instead of a regular password is that you can delete the app password later, ensuring the app no longer has access to your account.

To create a Bluesky password go to your [Settings page](https://bsky.app/settings). Then select `Privacy and Security > App passwords > Add app password`. Select a nice name for your password (eg. `follow-tools`), click `Next` and then make sure you copy the code `abcd-abcd-abcd-abcd` somewhere safe.

You can now use your user name and this code to use `follow-tools`.
