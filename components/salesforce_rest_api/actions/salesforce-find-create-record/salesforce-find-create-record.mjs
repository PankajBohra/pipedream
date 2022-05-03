import { ConfigurationError } from "@pipedream/platform";
import salesForceRestApi from "../../salesforce_rest_api.app.mjs";

export default {
  key: "salesforce_rest_api-salesforce-find-create-record",
  name: "Get Field Values from Object Record and optionally create one is none is found. ",
  description:
    "Finds a specified Salesforce record by a field. Optionally, create one if none is found. [API Doc](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_get_field_values.htm)",
  version: "0.0.1",
  type: "action",
  props: {
    salesForceRestApi,
    sobjectName: {
      type: "string",
      label: "Object name",
      description:
        "Salesforce standard object type of the record to get field values from.",
    },
    sobjectId: {
      type: "string",
      label: "Object id",
      description:
        "Id of the Salesforce standard object to get field values from.",
    },
    sobjectFields: {
      type: "string[]",
      label: "Fields to get values from",
      description:
        "list of the Salesforce standard object's fields to get values from.",
    },
    createIfNotFound: {
      type: "boolean",
      label: "Create new object",
      description: "Create a new object if none is found",
      reloadProps: true,
    },
  },
  async additionalProps() {
    return {
      sobject: {
        type: "object",
        label: "Salesforce standard object",
        description: `Data of the Salesforce standard object record to create.
          Salesforce standard objects are described in [Standard Objects](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_list.htm) section of the [SOAP API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_quickstart_intro.htm).`,
      },
    };
  },
  async run({ $ }) {
    const {
      sobjectName,
      sobjectId,
      sobjectFields,
      sobject,
      createIfNotFound,
    } = this;
    let createData;
    try {
      createData = await this.salesForceRestApi.getSObject(
        sobjectName,
        sobjectId,
        sobjectFields && {
          fields: sobjectFields.join(","),
        },
      );
    } catch (error) {
      if (!createIfNotFound)  throw new ConfigurationError("Record not found");
    }

    if (createIfNotFound && !createData) {
      const response = await this.salesForceRestApi.createSObject(
        "Account",
        sobject,
      );
      response &&  $.export(
        "$summary", "Record successfully created",
      );
      return response;
    }
    return createData;
  },
};