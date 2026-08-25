import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog & Guides',
  description: '',
};

export default function Page() {
  return (
    <main>
  
  
    
  <section className='bk-hero-band'>
      <div className='bk-wrap'>
        <div className='bk-hero-card'>
          <div>
            <span className='bk-eyebrow'><i></i>REM Resources</span>
            <h1 className='bk-h1'>Playbooks for building a remote team that <span className='hl'>actually delivers.</span></h1>
            <p className='bk-lede'>Hiring guides, cost breakdowns and operating templates from the team that sources, onboards and manages dedicated remote staff every day.</p>
            <form className='bk-search' role='search'>
              <svg viewBox='0 0 24 24' fill='none' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7' /><line x1='16' y1='7' x2='20.5' y2='20' /></svg>
              <input type='search' placeholder='Search guides and articles…' aria-label='Search resources' />
            </form>
          </div>
  
          <a href='/blog/post' className='bk-featured'>
            <div className='bk-thumb'>
              <span className='bk-badge'>Featured</span>
              <img className='bk-thumb-pic' src='/blog/hiring-offshore.svg' alt='' loading='lazy' />
            </div>
            <div className='bk-featured-body'>
              <div className='bk-topic'>Hiring Strategy</div>
              <h3>The 2026 Guide to Hiring Offshore Without Losing Quality Control</h3>
              <p>What separates teams that scale from teams that stay stuck — scope the role, run the first 90 days, and track the four KPIs that predict retention.</p>
              <div className='bk-meta'>
                <img src='/teams/Johnathan.jpg' alt='' />
                <div><div className='who'>Johnathan M.</div><div className='when'>Aug 6, 2026 · 11 min read</div></div>
                <span className='read'>Read more<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14' /><path d='m13 6 6 6-6 6' /></svg></span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  
  
    
  <section className='bk-band'>
      <div className='bk-wrap'>
        <div className='bk-head'>
          <h2>Latest resources</h2>
          <p>Three practical guides to start with</p>
        </div>
  
        <div className='bk-grid'>
  
          <a href='/blog/post' className='bk-card'>
            <div className='bk-thumb-sm g1'><img className='bk-thumb-pic' src='/blog/role-scorecard.svg' alt='' loading='lazy' /><span className='bk-type'>Guide</span></div>
            <div className='bk-card-body'>
              <div className='bk-topic'>Hiring Strategy</div>
              <h3>The Role Scorecard: Define a Remote Hire in One Page</h3>
              <p>A fill-in template that turns “I need help” into a roleable hire with clear outcomes and KPIs.</p>
              <div className='bk-meta'>
                <img src='/teams/Kalkidan.jpg' alt='' />
                <div><div className='who'>Kalkidan T.</div><div className='when'>Aug 4, 2026 · 7 min</div></div>
                <span className='read'>Read<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14' /><path d='m13 6 6 6-6 6' /></svg></span>
              </div>
            </div>
          </a>
  
          <a href='/blog/post' className='bk-card'>
            <div className='bk-thumb-sm g2'><img className='bk-thumb-pic' src='/blog/cost-roi.svg' alt='' loading='lazy' /><span className='bk-type'>Blog</span></div>
            <div className='bk-card-body'>
              <div className='bk-topic'>Cost &amp; ROI</div>
              <h3>When Offshore Hiring Is the Wrong Call</h3>
              <p>Four situations where staying local is cheaper — and what to do instead in each one.</p>
              <div className='bk-meta'>
                <img src='/teams/Minassie.jpg' alt='' />
                <div><div className='who'>Minassie B.</div><div className='when'>Jul 30, 2026 · 6 min</div></div>
                <span className='read'>Read<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14' /><path d='m13 6 6 6-6 6' /></svg></span>
              </div>
            </div>
          </a>
  
          <a href='/blog/post' className='bk-card'>
            <div className='bk-thumb-sm g3'><img className='bk-thumb-pic' src='/blog/onboarding-30-days.svg' alt='' loading='lazy' /><span className='bk-type'>Guide</span></div>
            <div className='bk-card-body'>
              <div className='bk-topic'>Team Management</div>
              <h3>The First 30 Days: An Onboarding Plan You Can Copy</h3>
              <p>Week-by-week milestones, access checklists and the check-in cadence that builds trust fast.</p>
              <div className='bk-meta'>
                <img src='/teams/Yonas.jpg' alt='' />
                <div><div className='who'>Yonas B.</div><div className='when'>Jul 25, 2026 · 9 min</div></div>
                <span className='read'>Read<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14' /><path d='m13 6 6 6-6 6' /></svg></span>
              </div>
            </div>
          </a>
  
        </div>
  
        <div className='bk-newsletter'>
          <div>
            <span className='bk-eyebrow'><i></i>The REM Brief</span>
            <h2>One useful email a month. Nothing else.</h2>
            <p>Salary benchmarks, hiring templates and the occasional teardown of what worked for a client last quarter.</p>
          </div>
          <form className='bk-news-form'>
            <input type='email' placeholder='you@company.com' aria-label='Work email' />
            <button type='submit'>Subscribe</button>
          </form>
        </div>
  
      </div>
    </section>
  
  
  
    </main>
  );
}
