# kaggle-node

NodeJS Library for [Kaggle API](https://www.kaggle.com/docs/api), accessible via npm.

## Installation

```sh
npm i kaggle-node
```

## Development

### Authenticate

Authenticating is only needed to access public resources requiring user consent or private resources.

First, you will need a Kaggle account. You can sign up [here](https://www.kaggle.com/).

After login, you can download your Kaggle API credentials at https://www.kaggle.com/settings by clicking the "Create New Token" button under the **API** section.

```
{"username": YOUR_USERNAME,"key": YOUR_KEY}
```

### Usage

Import and create `KaggleNode` object.
```ts
import { KaggleNode } from 'kaggle-node';

let kaggleNode = new KaggleNode({
  credentials: {
      username: YOUR_USERNAME,
      key: YOUR_KEY
  }
});
```

### Datasets

Search datasets.

```ts
let res = await kaggleNode.datasets.search();

/**
Filter search.
  'sortBy' - Apply Kaggle sorting criteria, default 'HOTTEST'.
  'fileType' - Filter by associated file type.
  'license' - Filter by license.
  'search' - Filter by keyword search.
  'tagIds' - Filter by tags.
  'username' - Filter by Kaggle user account.
  'page' - API pagination, pagesize of 20.
  'minSize', 'maxSize' - Filter by bytesize.
**/

let res = await kaggleNode.datasets.search({
  sortBy: DatasetQuerySorting.UPDATED,
  fileType: DatasetQueryFileTypes.JSON,
  license: DatasetQueryLicenses.GPL,
  search: "tools",
  tagIds: [4141, 1070],
  username: 'rashadrmammadov',
  page: 2,
  minSize: 10,
  maxSize: 1000000
} as DatasetQueryOptions);
```

To learn more about filtering options, check out [DatasetQueryEnums.ts](src/enums/DatasetQueryEnums.ts).

To interact with datasets, use the associated handle string. This can be found from parsing the dataset's URL or accessing the `ref` property within a dataset search response.

If you would like to specify versioning, append a `versions` clause followed by the version number. To learn about a dataset's versioning, 
navigate to "Data Explorer" on the right-hand side of the dataset's web page or preview the dataset.

Consider https://www.kaggle.com/datasets/jessicali9530/animal-crossing-new-horizons-nookplaza-dataset.

```ts
let handleStr;

handleStr = 'jessicali9530/animal-crossing-new-horizons-nookplaza-dataset';
handleStr = 'jessicali9530/animal-crossing-new-horizons-nookplaza-dataset/versions/2';
```

Preview datasets.

```ts
let res = await kaggleNode.datasets.view(handleStr); // application/json
```

List datasets' files.

```ts
let res = await kaggleNode.datasets.list(handleStr); // application/json
```

Download an entire dataset.

```ts
let res = await kaggleNode.datasets.download(handleStr); // application/zip
```

Download a specific file within a dataset.

```ts
let res = await kaggleNode.datasets.download(handleStr, "accessories.csv"); // text/csv
```

[Common MIME types for file responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)

## Roadmap

### To Do

- [X] Datasets
- [ ] Notebooks
- [ ] Colab

Contributions to this repo are welcome. This library is based off Kaggle's official API repos. I advise referencing them for new implementation, to keep functionality standard.

### References

https://github.com/Kaggle/kaggle-api

https://github.com/Kaggle/kagglehub/tree/main

## License

kaggle-node is released under the [ISC license](LICENSE.txt).