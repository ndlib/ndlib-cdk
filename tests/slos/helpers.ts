/**
 * DashboardBody is often a stringified json, but with an Fn::Join to concatenate the string with references
 * such as { Ref: AWS::Region }. This makes it difficult to parse as a single json for matching. This function
 * Collapses the Fn::Join into a single string. Replacing any { Ref: ResourceId } object params with the literal
 * string ${ResourceId}.
 *
 * @param dashBody The captured DashboardBody that contains the Fn::Join
 */
export const collapseJoin = (dashBody: any): string => {
  const joinParams = dashBody['Fn::Join'];
  return Object.values(joinParams[1]).reduce((previous: string, current: any) => {
    let val = current;
    if (typeof val === 'object' && val['Ref'] !== undefined)
      // Replace the object { Ref: ABC123 } with the literal string '${ABC123}'
      val = `\${${val['Ref']}}`;
    return previous + val;
  }, '');
};
