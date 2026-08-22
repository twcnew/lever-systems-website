import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  CHANNEL_MATRIX_CHANNELS,
  CHANNEL_MATRIX_CTA,
  CHANNEL_MATRIX_CTA_ACCENT,
  CHANNEL_MATRIX_KICKER,
  CHANNEL_MATRIX_KICKER_ACCENT,
  CHANNEL_MATRIX_ROWS,
  CHANNEL_MATRIX_TITLE,
  CHANNEL_MATRIX_TITLE_ACCENT,
  type ChannelMatrixCell,
  type ChannelMatrixChannelId,
} from "@/lib/studio/channelMatrix";

export type ChannelMatrixTheme = "dark" | "light" | "orange";

function accentSpan(text: string, accent: string) {
  const index = text.indexOf(accent);
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="channel-matrix__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function ChannelIcon({ channel }: { channel: ChannelMatrixChannelId }) {
  if (channel === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 6.5h17v11h-17z" />
        <path d="m4.5 7.5 7.5 6 7.5-6" />
      </svg>
    );
  }

  if (channel === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <path d="M8 10v6M8 7.5v.2M11.5 16v-6m0 2.7c.8-1.8 4.5-2 4.5 1V16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 4.5 10 8.8 8.1 11c1.1 2.2 2.7 3.8 4.9 4.9l2.2-1.9 4.3 2.8-.8 3c-.2.8-1 1.3-1.8 1.2C9.8 20.2 3.8 14.2 3 7.1c-.1-.8.4-1.6 1.2-1.8z" />
    </svg>
  );
}

function MatrixCell({ cell }: { cell: ChannelMatrixCell }) {
  if (cell.chips) {
    return (
      <div className="channel-matrix__chips">
        {cell.chips.map((chip) => (
          <span className="channel-matrix__chip" key={chip}>
            <span aria-hidden="true">✦</span>
            {chip}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="channel-matrix__copy">
      {cell.lead ? <strong>{cell.lead}</strong> : null}
      {cell.lines?.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

export function ChannelMatrixAsset({
  theme = "dark",
}: {
  theme?: ChannelMatrixTheme;
}) {
  return (
    <div className={`channel-matrix channel-matrix--${theme}`}>
      <div className="spine-glass__aurora" aria-hidden="true" />
      <div className="channel-matrix__grid" aria-hidden="true" />
      <div className="spine-glass__grain" aria-hidden="true" />

      <span className="spine-glass__url" aria-hidden="true">
        lever.systems
      </span>

      <header className="spine-glass__topbar">
        <div className="spine-glass__byline">
          <img
            className="spine-glass__avatar"
            src={withBasePath(ABOUT_CONTENT.founder.avatarPhoto)}
            alt={ABOUT_CONTENT.founder.name}
            width={48}
            height={48}
          />
          <span className="spine-glass__name">{ABOUT_CONTENT.founder.name}</span>
          <span className="spine-glass__dot" aria-hidden="true">
            ·
          </span>
          <span className="spine-glass__role">
            {ABOUT_CONTENT.founder.role}.
          </span>
          <Brand className="spine-glass__wordmark" />
        </div>
      </header>

      <header className="channel-matrix__hero">
        <h1 className="channel-matrix__title">
          {accentSpan(CHANNEL_MATRIX_TITLE, CHANNEL_MATRIX_TITLE_ACCENT)}
        </h1>
        <p className="channel-matrix__kicker">
          {accentSpan(CHANNEL_MATRIX_KICKER, CHANNEL_MATRIX_KICKER_ACCENT)}
        </p>
      </header>

      <div className="channel-matrix__frame">
        <table className="channel-matrix__table">
          <colgroup>
            <col className="channel-matrix__factor-col" />
            {CHANNEL_MATRIX_CHANNELS.map((channel) => (
              <col key={channel.id} className={`channel-matrix__${channel.id}-col`} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="channel-matrix__factor-head">
                Factor
              </th>
              {CHANNEL_MATRIX_CHANNELS.map((channel) => (
                <th
                  scope="col"
                  key={channel.id}
                  className={`channel-matrix__channel-head channel-matrix__channel-head--${channel.id}`}
                >
                  <span className="channel-matrix__channel-icon">
                    <ChannelIcon channel={channel.id} />
                  </span>
                  <span>{channel.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHANNEL_MATRIX_ROWS.map((row) => (
              <tr key={row.factor}>
                <th scope="row" className="channel-matrix__factor">
                  {row.factor}
                </th>
                {CHANNEL_MATRIX_CHANNELS.map((channel) => (
                  <td
                    key={channel.id}
                    className={`channel-matrix__cell channel-matrix__cell--${channel.id}`}
                  >
                    <MatrixCell cell={row.cells[channel.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="channel-matrix__closer">
        <span className="channel-matrix__closer-stars" aria-hidden="true">
          ✦✦
        </span>
        {accentSpan(CHANNEL_MATRIX_CTA, CHANNEL_MATRIX_CTA_ACCENT)}
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
