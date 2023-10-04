function getRequestedTopLevelFields(graphQlInfo) {
  return (
    graphQlInfo.fieldNodes[0].selectionSet.selections.reduce((arr, fieldNode) => {
      arr.push(fieldNode.name.value);
      return arr;
    }, [])
  );
}

module.exports = { getRequestedTopLevelFields }