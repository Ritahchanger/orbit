// One-line description of an activity log entry
import { Link } from "react-router-dom";
import { capitalise, formatDate, formatMoney } from "../utils/format";

const BusinessLink = ({ target }) =>
  target?.id ? (
    <Link
      to={`/platform/businesses/${target.id}`}
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
    >
      {target.name || "a business"}
    </Link>
  ) : (
    <span className="font-medium">{target?.name || "a business"}</span>
  );

// `withTarget` false omits the business name (used on that business's own page)
const ActivityDescription = ({ entry, withTarget = true }) => {
  switch (entry.action) {
    case "business.status_changed":
      return (
        <>
          Changed {withTarget && <BusinessLink target={entry.target} />}
          {withTarget ? " from " : "status from "}
          <span className="font-medium">{capitalise(entry.details?.from || "")}</span> to{" "}
          <span className="font-medium">{capitalise(entry.details?.to || "")}</span>
        </>
      );
    case "payment.recorded":
      return (
        <>
          Recorded a {formatMoney(entry.details?.amount, entry.details?.currency)} payment
          {withTarget && (
            <>
              {" "}from <BusinessLink target={entry.target} />
            </>
          )}
          {entry.details?.reference && <span className="font-mono text-xs"> ({entry.details.reference})</span>}
        </>
      );
    case "subscription.trial_extended":
      return (
        <>
          Extended {withTarget ? <><BusinessLink target={entry.target} />'s</> : "the"} trial by{" "}
          <span className="font-medium">{entry.details?.days} days</span> to {formatDate(entry.details?.to)}
        </>
      );
    case "subscription.plan_changed":
      return (
        <>
          Changed {withTarget ? <><BusinessLink target={entry.target} />'s</> : "the"} plan from{" "}
          <span className="font-medium">
            {capitalise(entry.details?.from?.plan || "")} ({entry.details?.from?.billingCycle})
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {capitalise(entry.details?.to?.plan || "")} ({entry.details?.to?.billingCycle})
          </span>
        </>
      );
    case "auth.login":
      return "Signed in to the console";
    case "auth.login_failed":
      return "Failed sign-in attempt";
    case "auth.logout":
      return "Signed out";
    default:
      return entry.action;
  }
};

export default ActivityDescription;
