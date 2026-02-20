import { i18n } from './i18n.js';

// ============================================
// ABOUT PAGE - PURE TEXT VERSION, NO IMAGES!
// ============================================
// Bilkul aapke about.html jaisa - clean, premium, minimal
// Koi image nahi, koi diya nahi, koi flower nahi!
// Sirf text aur styling

export class AboutPage {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="about-page">
        <!-- HERO SECTION - BLACK BACKGROUND, NO IMAGE -->
        <section class="about-hero" style="background: #000000; padding: 5rem 2rem; text-align: center; color: white;">
          <div class="about-hero-content" style="max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 3.2rem; font-weight: 700; margin-bottom: 0.75rem; letter-spacing: -0.02em;" data-i18n="our_story">Our Story</h1>
            <p style="font-size: 1.2rem; opacity: 0.85; font-weight: 300;" data-i18n="preserving_tradition">Preserving tradition, one diya at a time</p>
          </div>
        </section>
        
        <!-- LEGACY SECTION - PURE TEXT, NO IMAGE -->
        <section class="about-section" style="padding: 4rem 2rem;">
          <div class="about-container" style="max-width: 1000px; margin: 0 auto;">
            <h2 class="section-title" style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; display: inline-block; letter-spacing: -0.01em; color: #000;" data-i18n="the_legacy">The Legacy</h2>
            
            <p style="color: #4A4A4A; margin-bottom: 1.2rem; font-size: 1.05rem; line-height: 1.7;" data-i18n="legacy_text1">
              For over four generations, the Prajapati family has been crafting handcrafted clay diyas in the heart of Gujarat. What started as a small village tradition has now become a celebrated art form, cherished by homes across the world.
            </p>
            
            <p style="color: #4A4A4A; margin-bottom: 1.2rem; font-size: 1.05rem; line-height: 1.7;" data-i18n="legacy_text2">
              Madhav Prajapati, the current torchbearer of this legacy, combines century-old techniques with contemporary design sensibilities. Each diya is meticulously handcrafted using premium alluvial clay from the banks of Narmada, sun-dried for 48 hours, and finished with natural dyes and traditional motifs.
            </p>
            
            <!-- BADGES -->
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
              <span style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); padding: 0.6rem 1.4rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; color: #B8860B; display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle" style="color: #D4AF37;"></i> <span data-i18n="handmade">100% Handmade</span>
              </span>
              <span style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); padding: 0.6rem 1.4rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; color: #B8860B; display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-leaf" style="color: #D4AF37;"></i> <span data-i18n="eco_friendly">Eco-Friendly</span>
              </span>
              <span style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); padding: 0.6rem 1.4rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; color: #B8860B; display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-tag" style="color: #D4AF37;"></i> <span data-i18n="premium_quality">Premium Quality</span>
              </span>
            </div>
          </div>
        </section>
        
        <!-- MISSION SECTION - DARK BACKGROUND -->
        <section class="about-section" style="background: #000000; padding: 4rem 2rem;">
          <div class="about-container" style="max-width: 1000px; margin: 0 auto;">
            <h2 class="section-title" style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; display: inline-block; letter-spacing: -0.01em; color: white;" data-i18n="our_mission">Our Mission</h2>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2rem;">
              <div style="background: #0F0F0F; padding: 2rem 1.5rem; border-radius: 16px; text-align: center; border: 1px solid rgba(212,175,55,0.2); transition: all 0.3s ease;">
                <i class="fas fa-hands" style="font-size: 2.2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #FFD700, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h3 style="color: #FFD700; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="empower_artisans">Empower Artisans</h3>
                <p style="color: #CCCCCC; font-size: 0.9rem; line-height: 1.6;" data-i18n="empower_text">Providing sustainable livelihoods to 50+ rural artisans and their families</p>
              </div>
              
              <div style="background: #0F0F0F; padding: 2rem 1.5rem; border-radius: 16px; text-align: center; border: 1px solid rgba(212,175,55,0.2); transition: all 0.3s ease;">
                <i class="fas fa-leaf" style="font-size: 2.2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #FFD700, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h3 style="color: #FFD700; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="sustainable_craft">Sustainable Craft</h3>
                <p style="color: #CCCCCC; font-size: 0.9rem; line-height: 1.6;" data-i18n="sustainable_text">100% natural materials, zero waste production, eco-friendly packaging</p>
              </div>
              
              <div style="background: #0F0F0F; padding: 2rem 1.5rem; border-radius: 16px; text-align: center; border: 1px solid rgba(212,175,55,0.2); transition: all 0.3s ease;">
                <i class="fas fa-globe-asia" style="font-size: 2.2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #FFD700, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h3 style="color: #FFD700; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="preserve_heritage">Preserve Heritage</h3>
                <p style="color: #CCCCCC; font-size: 0.9rem; line-height: 1.6;" data-i18n="heritage_text">Keeping ancient pottery techniques alive for future generations</p>
              </div>
              
              <div style="background: #0F0F0F; padding: 2rem 1.5rem; border-radius: 16px; text-align: center; border: 1px solid rgba(212,175,55,0.2); transition: all 0.3s ease;">
                <i class="fas fa-heart" style="font-size: 2.2rem; margin-bottom: 1rem; background: linear-gradient(135deg, #FFD700, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <h3 style="color: #FFD700; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="spread_joy">Spread Joy</h3>
                <p style="color: #CCCCCC; font-size: 0.9rem; line-height: 1.6;" data-i18n="joy_text">Bringing the warmth of tradition to modern homes worldwide</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- CRAFT SECTION - LIGHT BACKGROUND -->
        <section class="about-section" style="padding: 4rem 2rem;">
          <div class="about-container" style="max-width: 1000px; margin: 0 auto;">
            <h2 class="section-title" style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; display: inline-block; letter-spacing: -0.01em; color: #000;" data-i18n="the_craft">The Craft</h2>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
              <div style="display: flex; gap: 2rem; padding: 1.5rem; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); border-left: 4px solid transparent; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #D4AF37, #FF8C42); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.7; line-height: 1;" data-i18n="step_01">01</div>
                <div>
                  <h3 style="font-size: 1.2rem; color: #000; margin-bottom: 0.5rem; font-weight: 600;" data-i18n="sourcing_clay">Sourcing the Clay</h3>
                  <p style="color: #666; line-height: 1.7;" data-i18n="clay_text">We use premium alluvial clay from the banks of Narmada, known for its fine texture and natural strength.</p>
                </div>
              </div>
              
              <div style="display: flex; gap: 2rem; padding: 1.5rem; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); border-left: 4px solid transparent; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #D4AF37, #FF8C42); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.7; line-height: 1;" data-i18n="step_02">02</div>
                <div>
                  <h3 style="font-size: 1.2rem; color: #000; margin-bottom: 0.5rem; font-weight: 600;" data-i18n="hand_shaping">Hand-Shaping</h3>
                  <p style="color: #666; line-height: 1.7;" data-i18n="shaping_text">Each diya is meticulously shaped on the potter's wheel, a skill that takes years to master.</p>
                </div>
              </div>
              
              <div style="display: flex; gap: 2rem; padding: 1.5rem; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); border-left: 4px solid transparent; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #D4AF37, #FF8C42); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.7; line-height: 1;" data-i18n="step_03">03</div>
                <div>
                  <h3 style="font-size: 1.2rem; color: #000; margin-bottom: 0.5rem; font-weight: 600;" data-i18n="sun_drying">Sun Drying</h3>
                  <p style="color: #666; line-height: 1.7;" data-i18n="drying_text">The shaped diyas are dried naturally under the sun for 48 hours to achieve optimal hardness.</p>
                </div>
              </div>
              
              <div style="display: flex; gap: 2rem; padding: 1.5rem; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); border-left: 4px solid transparent; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #D4AF37, #FF8C42); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.7; line-height: 1;" data-i18n="step_04">04</div>
                <div>
                  <h3 style="font-size: 1.2rem; color: #000; margin-bottom: 0.5rem; font-weight: 600;" data-i18n="finishing">Finishing & Painting</h3>
                  <p style="color: #666; line-height: 1.7;" data-i18n="finishing_text">Each piece is hand-finished with natural pigments and traditional motifs.</p>
                </div>
              </div>
              
              <div style="display: flex; gap: 2rem; padding: 1.5rem; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); border-left: 4px solid transparent; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #D4AF37, #FF8C42); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.7; line-height: 1;" data-i18n="step_05">05</div>
                <div>
                  <h3 style="font-size: 1.2rem; color: #000; margin-bottom: 0.5rem; font-weight: 600;" data-i18n="quality_check">Quality Check</h3>
                  <p style="color: #666; line-height: 1.7;" data-i18n="quality_text">Every diya undergoes rigorous quality inspection before being carefully packaged.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- VALUES SECTION - LIGHT BACKGROUND -->
        <section class="about-section" style="background: #FEF9E7; padding: 4rem 2rem;">
          <div class="about-container" style="max-width: 1000px; margin: 0 auto;">
            <h2 class="section-title" style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; position: relative; display: inline-block; letter-spacing: -0.01em; color: #000;" data-i18n="our_values">Our Values</h2>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2rem;">
              <div style="background: white; padding: 1.8rem 1.2rem; border-radius: 16px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease;">
                <h3 style="color: #D4AF37; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="authenticity">Authenticity</h3>
                <p style="font-size: 0.9rem; color: #4A4A4A; line-height: 1.6;" data-i18n="authenticity_text">Every piece is 100% handmade and carries the unique imprint of its creator</p>
              </div>
              
              <div style="background: white; padding: 1.8rem 1.2rem; border-radius: 16px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease;">
                <h3 style="color: #D4AF37; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="quality">Quality</h3>
                <p style="font-size: 0.9rem; color: #4A4A4A; line-height: 1.6;" data-i18n="quality_text">We never compromise on materials or craftsmanship</p>
              </div>
              
              <div style="background: white; padding: 1.8rem 1.2rem; border-radius: 16px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease;">
                <h3 style="color: #D4AF37; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="ethics">Ethics</h3>
                <p style="font-size: 0.9rem; color: #4A4A4A; line-height: 1.6;" data-i18n="ethics_text">Fair wages, safe working conditions, and respect for our artisans</p>
              </div>
              
              <div style="background: white; padding: 1.8rem 1.2rem; border-radius: 16px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease;">
                <h3 style="color: #D4AF37; margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;" data-i18n="innovation">Innovation</h3>
                <p style="font-size: 0.9rem; color: #4A4A4A; line-height: 1.6;" data-i18n="innovation_text">Honoring tradition while embracing contemporary design</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
    
    // Update i18n content
    i18n.updatePageContent();
  }
}

// ============================================
// EXPORT EMPTY CONFIG - NO IMAGES NEEDED!
// ============================================
export const AboutImages = {};