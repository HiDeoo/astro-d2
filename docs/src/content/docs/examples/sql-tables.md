---
title: SQL Tables
sidebar:
  order: 6
---

The Astro D2 integration can be used to create diagrams representing [SQL tables](https://d2lang.com/tour/sql-tables):

````md title="src/content/docs/example.md"
```d2
Cloud: {
  events: {
    shape: sql_table
    id: int {constraint: primary_key}
  }

  pages: {
    shape: sql_table
    id: int {constraint: primary_key}
    event: int {constraint: foreign_key}
    content: blob
  }
  pages.event -> events.id

  Queue -> events
}
```
````

The above code block will be rendered as the following diagram:

```d2
Cloud: {
  events: {
    shape: sql_table
    id: int {constraint: primary_key}
  }

  pages: {
    shape: sql_table
    id: int {constraint: primary_key}
    event: int {constraint: foreign_key}
    content: blob
  }
  pages.event -> events.id

  Queue -> events
}
```
